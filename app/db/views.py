from django.http import JsonResponse, HttpResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.clickjacking import xframe_options_exempt
from django.utils.decorators import method_decorator
from django.views import View
from django.core import serializers
from .models import Issue, Comment, Vote, Announcement
from .utils import hash_username
import json


class CreateIssueView(View):
    def post(self, request):
        data = json.loads(request.body)
        issue = Issue.objects.create(
            title=data["title"],
            description=data["description"],
            created_at=data["created_at"],
        )
        return JsonResponse({"id": issue.id})


class IssueIndexView(View):
    def get(self, request):
        issues = list(Issue.objects.values())
        response = JsonResponse(issues, safe=False)
        response["Access-Control-Allow-Origin"] = "*"
        return response

    def options(self, request, *args, **kwargs):
        response = JsonResponse({})
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "GET, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type"
        return response


@method_decorator(csrf_exempt, name="dispatch")
@method_decorator(require_http_methods(["GET"]), name="dispatch")
@method_decorator(xframe_options_exempt, name="dispatch")
class IssueView(View):
    def get(self, request, issue_id):
        try:
            issue = Issue.objects.get(id=issue_id)
            response = JsonResponse(
                {
                    "id": issue.id,
                    "title": issue.title,
                    "description": issue.description,
                    "upvotes": issue.upvotes,
                    "created_at": issue.created_at,
                }
            )
            response["Access-Control-Allow-Origin"] = "*"
            return response
        except Issue.DoesNotExist:
            response = JsonResponse({"error": "Issue not found"}, status=404)
            response["Access-Control-Allow-Origin"] = "*"
            return response


class CommentView(View):
    targets = {
        "announcement": Announcement,
        "issue": Issue,
    }

    def get(self, request, target_type, target_id):
        if target_type not in self.targets:
            return JsonResponse({"error": "Invalid target for comments."}, status=400)

        target_model = self.targets[target_type]

        try:
            object = target_model.objects.get(id=target_id)
            comments = object.comments.all()
            comments_json = serializers.serialize("json", comments)
            return HttpResponse(comments_json, content_type="application/json")
        except target_model.DoesNotExist:
            return JsonResponse({"error": f"{target_type.capitalize()} not found"}, status=404)

    def post(self, request, target_type, target_id):
        if target_type not in self.targets:
            return JsonResponse({"error": "Invalid target for comments."}, status=400)

        target_model = self.targets[target_type]

        try:
            object = target_model.objects.get(id=target_id)
            data = json.loads(request.body)
            text = data.get("text")
            if not text:
                return JsonResponse({"error": "Comment text is required"}, status=400)
            comment = Comment.objects.create(text=text)
            object.comments.add(comment)
            return JsonResponse({"success": f"{target_model.__name__} commented successfully"})
        except target_model.DoesNotExist:
            return JsonResponse({"error": "Issue not found"}, status=404)


class IssueUpvoteView(View):
    def post(self, request, issue_id):
        try:
            issue = Issue.objects.get(id=issue_id)

            username = json.loads(request.body).get("user")
            if not username:
                return JsonResponse({"error": "Username is required for double vote prevention"}, status=400)

            user_hash = hash_username(username)

            if issue.votes.filter(user_hash=user_hash).exists():
                return JsonResponse({"error": "User has already voted for this issue"}, status=400)

            Vote.objects.create(issue=issue, user_hash=user_hash)

            issue.upvotes += 1
            issue.save()

            print(JsonResponse({"success": "Issue upvoted successfully", "upvotes": issue.upvotes}))
            return JsonResponse({"success": "Issue upvoted successfully", "upvotes": issue.upvotes})
        except Issue.DoesNotExist:
            return JsonResponse({"error": f"Issue with ID {issue_id} not found"}, status=404)
        except Exception as e:
            print(e)
            return JsonResponse({"error": str(e)}, status=500)

    def options(self, request, *args, **kwargs):
        response = JsonResponse({})
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "GET, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type"
        return response


class AnnouncementViewAdmin(View):
    def post(self, request):
        try:
            data = json.loads(request.body)
            issue = Announcement.objects.create(
                title=data["title"],
                text=data["text"],
            )
            return JsonResponse({"id": issue.id})
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON"}, status=400)
        except KeyError:
            return JsonResponse({"error": "Missing fields in JSON"}, status=400)


class AnnouncementIndexView(View):
    def get(self, request):
        try:
            announcements = list(Announcement.objects.values())
            response = JsonResponse(announcements, safe=False)
            response["Access-Control-Allow-Origin"] = "*"
            return response
        except Announcement.DoesNotExist:
            return JsonResponse({"error": "No announcements found"}, status=404)


class AnnouncementView(View):
    def get(self, request, announcement_id):
        try:
            announcement = Announcement.objects.get(id=announcement_id)
            response = JsonResponse(
                {
                    "id": announcement.id,
                    "title": announcement.title,
                    "description": announcement.text,
                    "upvotes": announcement.upvotes,
                    "created_at": announcement.created_at,
                }
            )
            print(response.content)
            return response
        except Announcement.DoesNotExist:
            response = JsonResponse({"error": "Announcement not found"}, status=404)
            return response
