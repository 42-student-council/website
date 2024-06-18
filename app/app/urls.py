from django.contrib import admin
from django.urls import path
from db.views import *

urlpatterns = [
    path("api/issues/create/", CreateIssueView.as_view(), name="create_issue"),
    path("api/issues/<int:issue_id>/upvote/", IssueUpvoteView.as_view(), name="view_issue"),
    path("api/issues/<int:issue_id>/comments/", CommentView.as_view(), name="view_comments"),
    path("api/issues/", IssueIndexView.as_view(), name="list_issues"),
    path("api/issues/<int:issue_id>/", IssueView.as_view(), name="view_issue"),
    path("api/announcements/", AnnouncementIndexView.as_view(), name="announcements"),
    path("api/announcements/<int:issue_id>/", AnnouncementView.as_view(), name="announcements"),
    path("api/admin/announcements/", AnnouncementViewAdmin.as_view(), name="new_announcement"),
]
