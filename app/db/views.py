from django.shortcuts import render
from django.http import JsonResponse


def get_data(request):
    data = {
        "Header": {
            "title": "Student Council",
            "paragraph": "Official Website of the 42 Vienna Student Council",
        },
        "About": {
            "title": "What is the Student Council?",
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
        "Issue": {
            "title": "Something You want to change?",
            "paragraph": """
            Fill out the form below to raise an issue.
            This can be anything from a broken toilet to a new school policy.
            This process is completely anonymous.
            """,
        },
        "Contact": {
            "title": "Want to talk to us directly?",
            "paragraph": """
            Please fill out the form below.
            We will get back to you as soon as possible.
            """,
        },
    }
    return JsonResponse(data)
