from django.http import JsonResponse, HttpResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.clickjacking import xframe_options_exempt
from django.utils.decorators import method_decorator
from django.views import View
from django.core import serializers
from .models import *
from .utils import hash_username
import json
from datetime import timedelta
from django.utils import timezone
from django.core.cache import cache


class IssueListView(View):
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

    def post(self, request):
        data = json.loads(request.body)
        issue = Issue.objects.create(
            title=data["title"],
            description=data["description"],
            created_at=data["created_at"],
        )
        return JsonResponse({"id": issue.id})


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
    RATE_LIMIT_KEY_PREFIX = "comment_rate_limit"
    RATE_LIMIT_THRESHOLD = 5
    RATE_LIMIT_PERIOD = timedelta(minutes=1)

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

            username = data.get("user", {}).get("user")
            if not username:
                return JsonResponse({"error": "Username is required"}, status=400)

            hashed_user = hash_username(username)
            user_key = f"{self.RATE_LIMIT_KEY_PREFIX}_{hashed_user}_{target_id}"
            now = timezone.now()
            comment_activity = cache.get(user_key, [])

            comment_activity = [timestamp for timestamp in comment_activity if timestamp > now - self.RATE_LIMIT_PERIOD]
            if len(comment_activity) >= self.RATE_LIMIT_THRESHOLD:
                return JsonResponse({"error": "Rate limit exceeded. Please try again later."}, status=429)

            comment_activity.append(now)
            cache.set(user_key, comment_activity, timeout=int(self.RATE_LIMIT_PERIOD.total_seconds()))

            user, created = User.objects.get_or_create(_hash=hash_username(hashed_user))

            comment = Comment.objects.create(user=user, text=text)
            object.comments.add(comment)
            return JsonResponse({"success": f"{target_model.__name__} commented successfully"})
        except target_model.DoesNotExist:
            return JsonResponse({"error": "Issue not found"}, status=404)
        except Exception as e:
            print(e)
            return JsonResponse({"error": "An unexpected error occurred"}, status=500)


class IssueUpvoteView(View):
    def post(self, request, issue_id):
        try:
            issue = Issue.objects.get(id=issue_id)
            username = json.loads(request.body).get("user")
            if not username:
                return JsonResponse(
                    {"error": "Username is required for double vote prevention"},
                    status=400,
                )

            user, created = User.objects.get_or_create(_hash=hash_username(username))
            issue_content_type = ContentType.objects.get_for_model(Issue)

            if Vote.objects.filter(content_type=issue_content_type, object_id=issue.id, user=user).exists():
                issue.upvotes -= 1
                issue.save()
                Vote.objects.filter(content_type=issue_content_type, object_id=issue.id, user=user).delete()
                return JsonResponse({"success": "Successfully removed the vote.", "upvotes": issue.upvotes}, status=200)

            Vote.objects.create(content_type=issue_content_type, object_id=issue.id, user=user)
            issue.upvotes += 1
            issue.save()

            return JsonResponse({"success": "Issue upvoted successfully", "upvotes": issue.upvotes})
        except Issue.DoesNotExist:
            return JsonResponse({"error": f"Issue with ID {issue_id} not found"}, status=404)
        except Exception as e:
            print(e)
            return JsonResponse({"error": "An unexpected error occurred"}, status=500)

    def options(self, request, *args, **kwargs):
        response = JsonResponse({})
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "GET, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type"
        return response


@method_decorator(csrf_exempt, name="dispatch")
class CouncilMemberView(View):
    def get(self, request, login):
        try:
            council_member = CouncilMember.objects.get(login=login)
            response = JsonResponse(
                {
                    "login": council_member.login,
                    "first_name": council_member.first_name,
                    "last_name": council_member.last_name,
                    "email": council_member.email,
                    "profile_picture": council_member.profile_picture,
                }
            )
            response["Access-Control-Allow-Origin"] = "*"
            return response
        except CouncilMember.DoesNotExist:
            response = JsonResponse({"error": "Council Member not found."}, status=404)
            response["Access-Control-Allow-Origin"] = "*"
            return response

    def delete(self, request, login):
        try:
            council_member = CouncilMember.objects.get(login=login)
            council_member.delete()
            return JsonResponse({"success": "Council Member deleted."})
        except CouncilMember.DoesNotExist:
            return JsonResponse({"error": "Council Member not found."}, status=404)

    def options(self, request, *args, **kwargs):
        response = JsonResponse({})
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "GET, DELETE, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type"
        return response


class CouncilMemberListView(View):
    def get(self, request):
        council_members = list(CouncilMember.objects.values())
        response = JsonResponse(council_members, safe=False)
        response["Access-Control-Allow-Origin"] = "*"
        return response

    def post(self, request):
        data = json.loads(request.body)
        council_member = CouncilMember.objects.create(
            login=data["login"],
            first_name=data["first_name"],
            last_name=data["last_name"],
            email=data["email"],
            profile_picture=data["profile_picture"],
        )
        return JsonResponse({"login": council_member.login})

    def options(self, request, *args, **kwargs):
        response = JsonResponse({})
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
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
            return response
        except Announcement.DoesNotExist:
            response = JsonResponse({"error": "Announcement not found"}, status=404)
            return response
