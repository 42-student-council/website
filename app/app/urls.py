from django.contrib import admin
from django.urls import path
from db.views import *

urlpatterns = [
    path("api/issues/<int:issue_id>/", IssueView.as_view(), name="view_issue"),
    path(
        "api/issues/<int:issue_id>/upvote/",
        IssueUpvoteView.as_view(),
        name="view_issue",
    ),
    path(
        "api/issues/<int:issue_id>/comments/",
        CommentView.as_view(),
        name="view_comments",
    ),
    path("api/issues/", IssueListView.as_view(), name="list_issues"),
    path(
        "api/comments/<str:target_type>/<int:target_id>/",
        CommentView.as_view(),
        name="view_comments",
    ),
    path(
        "api/council-members/",
        CouncilMemberListView.as_view(),
        name="view_council_members",
    ),
    path(
        "api/council-members/<str:login>/",
        CouncilMemberView.as_view(),
        name="view_council_member",
    ),
]
