from django.contrib import admin
from django.urls import path
from db import views

urlpatterns = [
    path("api/frontend/data/", views.get_frontend_data, name="get_frontend_data"),
    path("api/issue/create/", views.create_issue, name="create_issue"),
    path("api/issue/view/all/", views.view_all_issues, name="view_all_issues"),
]
