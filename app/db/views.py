from django.shortcuts import render
from django.http import JsonResponse

def get_data(request):
    data = {
        "Header": {
            "title": "Student Council",
            "paragraph": "Official Website of the 42 Vienna Student Council",
        },
    }
    return JsonResponse(data)