from django.shortcuts import render
from django.http import JsonResponse
import json
from .models import Comment, Issue


def get_frontend_data(request):
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
