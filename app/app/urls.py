from django.contrib import admin
from django.urls import path
from db.views import *

urlpatterns = [
    path("api/issues/create/", views.CreateIssueView.as_view(), name="create_issue"),
    path("api/issues/<int:issue_id>/", views.IssueView.as_view(), name="view_issue"),
    path(
        "api/issues/<int:issue_id>/upvote/",
        views.IssueUpvoteView.as_view(),
        name="view_issue",
    ),
    path(
        "api/issues/<int:issue_id>/comments/",
        views.CommentView.as_view(),
        name="view_comments",
    ),
    path("api/issues/", views.IssueListView.as_view(), name="list_issues"),
    path("api/comments/<str:target_type>/<int:target_id>/", CommentView.as_view(), name="view_comments"),
    path("api/announcements/", AnnouncementIndexView.as_view(), name="announcements"),
    path("api/announcements/<int:announcement_id>/", AnnouncementView.as_view(), name="announcement"),
    path("api/admin/announcements/", AnnouncementViewAdmin.as_view(), name="new_announcement"),
    path(
        "api/council-members/",
        views.CouncilMemberListView.as_view(),
        name="view_council_members",
    ),
    path(
        "api/council-members/<str:login>/",
        views.CouncilMemberView.as_view(),
        name="view_council_member",
    ),
]
