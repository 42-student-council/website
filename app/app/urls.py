from django.contrib import admin
from django.urls import path
from db import views

urlpatterns = [
    path("api/issue/create/", views.CreateIssueView.as_view(), name="create_issue"),
    path("api/issues/view/all/", views.IssueListView.as_view(), name="view_issues"),
    path("api/issues/view/<int:issue_id>/", views.IssueView.as_view(), name="view_issue"),
]
