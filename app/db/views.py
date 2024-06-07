from django.shortcuts import render
from django.http import JsonResponse

def get_data(request):
    data = {
        "Header": {
            "Title": "42 Vienna Student Council",
            "Subtitle": "Official Website",
        },
    }
    return JsonResponse(data)