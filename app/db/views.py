from django.shortcuts import render
from django.http import JsonResponse
import json
from .models import Comment, Issue


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


def view_all_issues(request):
    if request.method == "GET":
        issues = Issue.objects.all()
        data = [{"id": issue.id, "title": issue.title, "description": issue.description} for issue in issues]
        return JsonResponse(data)
