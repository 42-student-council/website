from django.contrib import admin
from django.urls import path
from db import views

urlpatterns = [
    path("api/frontend-data/", views.get_frontend_data, name="get_frontend_data"),
]
