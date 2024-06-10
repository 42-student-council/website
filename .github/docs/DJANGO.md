# Django Architecture

This section provides and overview of the Django architecture and instructions on how to add and manage various components like views, models and URLs.

This section assumes that you have a basic understanding of REST APIs and Relational databases.

If not, we recommend you take a look at these articles:
*  [REST APIs](https://www.freecodecamp.org/news/how-to-use-rest-api/)
*  [Relational Databases](https://cloud.google.com/learn/what-is-a-relational-database?hl=de#:~:text=A%20relational%20database%20is%20a,structures%20relate%20to%20each%20other.)

If you are not familiar with this and are feeling a little overwhelmed, don't worry about it! These are things you will learn during your cursus and this project is not running away. You can still contribute by finding bugs and proposing changes.

## Table of Contents
- [Project Structure](#project-structure)
- [Adding Models](#adding-models)
- [Creating and Applying Migrations](#creating-and-applying-migrations)
- [Adding Views](#adding-views)
- [Configuring URLs](#configuring-urls)

## Project Structure

Our Django project structure looks like this:
```
    app/
    │
    ├── app/
    │ ├── __init__.py
    │ ├── settings.py
    │ ├── urls.py
    │ ├── asgi.py
    │ └── wsgi.py
    │
    ├── db/
    │ ├── migrations/
    │ ├── __init__.py
    │ ├── admin.py
    │ ├── apps.py
    │ ├── models.py
    │ ├── views.py
    │ └── urls.py
    ├── manage.py
    └── requirements.txt
```

## Adding Models

Models in Django define the structure of your database. They are written in [models.py](~/app/db/models.py).

1. **Define a Model**: Create a new model by defining a class that inherits from `django.db.models.Model`.
  ```python3
    from django.db import models

    class NewModel(models.Model);
        name = models.CharField(max_length=100)
        description = models.TextField()
        created_at = models.DateTimeField(auto_now_add=True)
  ```

## Creating and Applying Migrations

After defining models, create and apply migrations to update the database. This should be handled automatically by [entrypoint.sh](~/app/startup/entrypoint.sh). When building with `make debug`, you should see output showing that your models have been created and your migrations applied.
Migrations are not handled by the statreloader, you have to rebuild for them to take effect!

1. **Create Migrations**: Generate migration files based on the changes in your models.
    ```sh
    python manage.py makemigrations
    ```
2. **Apply Migrations:** Apply the migrations to update the database schema.
    ```sh
    python manage.py makemigrations
    ```

## Adding Views

Views handle the logic for your application. They are written in [views.py](~/app/db/views.py).

1. **Define a View**: Create a new view function or class that handles a specific URL request.

    ```python3
    from .models import NewModel
    from django.view import View

    class NewView(View):
        def get(self, request):
            # your logic here
    ```
2. **Add the View to URLs**: Map the view to a URL in [urls.py](~/app/app/urls.py).

    ```python3
    from django.urls import path
    from db import views

    urlpatterns = [
        path("api/your/endpoint/", views.NewView.as_view(), name="new view"),
    ```

## Configuring URLs

URLs in Django are configured to map views to specific URLs. They are defined in [urls.py](~/app/app/urls.py).
    ```python3
    from django.urls import path
    from db import views

    urlpatterns = [
        path("api/your/endpoint", views.NewView.as_view(), name="new view"),
    ]

## Conclusion

This documentation provides a basic overview of the Django architecture and how to add models, views, and configure URLs. For more detailed information, refer to the [official Django documentation](https://docs.djangoproject.com/).

Feel free to contribute to this documentation if you think anything is unclear!
