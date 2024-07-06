from django.db import models
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey


class User(models.Model):
class User(models.Model):
    id = models.AutoField(primary_key=True)
    _hash = models.CharField(max_length=64)


class Poll(models.Model):
    id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)


class Question(models.Model):
    poll = models.ForeignKey(Poll, on_delete=models.CASCADE, related_name="questions")
    text = models.CharField(max_length=200)
    allow_multiple_choices = models.BooleanField(default=False)


class Choice(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name="choices")
    text = models.CharField(max_length=200)
    votes = models.IntegerField(default=0)


class Comment(models.Model):
    id = models.AutoField(primary_key=True)
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    upvotes = models.IntegerField(default=0)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="comments")

    def __str__(self):
        return self.text


class Issue(models.Model):
    id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=100)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    comments = models.ManyToManyField(Comment, related_name="issues", blank=True)
    comments = models.ManyToManyField(Comment, related_name="issues", blank=True)
    upvotes = models.IntegerField(default=0)

    def __str__(self):
        return self.title


class Announcement(models.Model):
    id = models.AutoField(primary_key=True)
    title = models.TextField()
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    comments = models.ManyToManyField(Comment, related_name="announcements", blank=True)
    upvotes = models.IntegerField(default=0)

    def __str__(self):
        return f"Announcement #{self.id}"


class Vote(models.Model):
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey("content_type", "object_id")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="votes")

    class Meta:
        unique_together = ("content_type", "object_id", "user")

    def __str__(self):
        return f"Vote for by {self.user._hash} on {self.content_type.name} #{self.object_id}"


class CouncilMember(models.Model):
    login = models.CharField(max_length=20, primary_key=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField()
    profile_picture = models.URLField()

    def __str__(self):
        return self.name
