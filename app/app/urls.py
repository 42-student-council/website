from django.contrib import admin
from django.urls import path
from db import views

urlpatterns = [
    path("api/data/", views.get_data, name="get_data"),
]
