from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.clickjacking import xframe_options_exempt
from django.utils.decorators import method_decorator
from django.views import View
from .models import Issue
import json


def get_frontend_data(request):
    if request.method == "GET":
        with open("./db/frontend-data/frontend-data.json") as f:
            data = json.load(f)
        return JsonResponse(data)


def create_issue(request):
    if request.method == "POST":
        data = json.loads(request.body)
        issue = Issue.objects.create(
            title=data["title"],
            description=data["description"],
            created_at=data["created_at"],
        )
        return JsonResponse({"id": issue.id})
    return JsonResponse({"error": "Invalid request"})


class IssueListView(View):
    def get(self, request):
        issues = list(Issue.objects.values())  # Convert queryset to a list of dictionaries
        response = JsonResponse(issues, safe=False)
        response["Access-Control-Allow-Origin"] = "*"  # Add CORS header here
        return response

    def options(self, request, *args, **kwargs):
        response = JsonResponse({})
        response["Access-Control-Allow-Origin"] = "*"  # Add CORS header here
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
