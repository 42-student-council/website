from django.http import JsonResponse, HttpResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.clickjacking import xframe_options_exempt
from django.utils.decorators import method_decorator
from django.views import View
from django.core import serializers
from .models import Issue, Comment
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
                }
            )
            response["Access-Control-Allow-Origin"] = "*"
            return response
        except Issue.DoesNotExist:
            response = JsonResponse({"error": "Issue not found"}, status=404)
            response["Access-Control-Allow-Origin"] = "*"
            return response

    def options(self, request, *args, **kwargs):
        response = JsonResponse({})
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "GET, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type"
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
        comment_text = data.get('text')

        if not comment_text:
            print(data)
            return JsonResponse({"error": "Comment text is required"}, status=400)

        comment = Comment.objects.create(text=comment_text)
        issue.comments.add(comment)

        response_data = serializers.serialize("json", [comment,])
        return HttpResponse(response_data, content_type="application/json", status=201)
