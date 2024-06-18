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
    def get(self, request, issue_id):
        try:
            issue = Issue.objects.get(id=issue_id)
            comments = issue.comments.all()
            comments_json = serializers.serialize("json", comments)
            return HttpResponse(comments_json, content_type="application/json")
        except Issue.DoesNotExist:
            return JsonResponse({"error": "Issue not found"}, status=404)

    def post(self, request, issue_id):
        try:
            issue = Issue.objects.get(id=issue_id)
        except Issue.DoesNotExist:
            return JsonResponse({"error": "Issue not found"}, status=404)

        data = json.loads(request.body)
        comment_text = data.get("text")

        if not comment_text:
            return JsonResponse({"error": "Comment text is required"}, status=400)

        comment = Comment.objects.create(text=comment_text)
        issue.comments.add(comment)

        response_data = serializers.serialize(
            "json",
            [
                comment,
            ],
        )
        return HttpResponse(response_data, content_type="application/json", status=201)


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
        data = json.loads(request.body)
        issue = Announcement.objects.create(
            title=data["title"],
            text=data["text"],
        )
        return JsonResponse({"id": issue.id})


class AnnouncementIndexView(View):
    def get(self, request):
        try:
            issues = list(Announcement.objects.values())
            response = JsonResponse(issues, safe=False)
            response["Access-Control-Allow-Origin"] = "*"
            return response
        except Announcement.DoesNotExist:
            return JsonResponse({"error": "No announcements found"}, status=404)


class AnnouncementView(View):
    def get():
        pass
