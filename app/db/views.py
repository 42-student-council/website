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
            This is a platform for you to anonymously share your thoughts, ideas, and concerns with us.
            """,
            "why": """
            Because we want everyone to be heard.
            Because we want transparent communication.
            Because we want to make a difference.
            """,
        },
    }
    return JsonResponse(data)