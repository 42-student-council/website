from django.shortcuts import render
from django.http import JsonResponse

def get_data(request):
    data = {
        "Header": {
            "title": "Student Council",
            "paragraph": "Official Website of the 42 Vienna Student Council",
        },
        "About": {
            "paragraph": """
            We are students who have been elected by our peers to represent them in the school's decision making process.
            """,
        },
    }
    return JsonResponse(data)