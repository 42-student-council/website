from django.shortcuts import render
from django.http import JsonResponse
import json


def get_frontend_data(request):
    with open("./db/frontend-data/frontend-data.json") as f:
        data = json.load(f)
    return JsonResponse(data)
