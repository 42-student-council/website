from django.db import models


class User(models.Model):
    id = models.AutoField(primary_key=True)
    _hash = models.CharField(max_length=64)


class Announcement(models.Model):
    id = models.AutoField(primary_key=True)
    title = models.TextField()
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    comments = models.ManyToManyField("Comment", related_name="announcements", blank=True)
    upvotes = models.IntegerField(default=0)

    def __str__(self):
        return f"Announcement #{self.id}"


class Vote(models.Model):
    issue = models.ForeignKey("Issue", on_delete=models.CASCADE, related_name="votes")
    user = models.ForeignKey("User", on_delete=models.CASCADE, related_name="votes")

    class Meta:
        unique_together = ("issue", "user")

    def __str__(self):
        return f"Vote for Issue #{self.issue.id} by {self.user_hash}"


class Comment(models.Model):
    id = models.AutoField(primary_key=True)
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    upvotes = models.IntegerField(default=0)
    user = models.ForeignKey("User", on_delete=models.CASCADE, related_name="comments")

    def __str__(self):
        return self.text


class Issue(models.Model):
    id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=100)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    comments = models.ManyToManyField("Comment", related_name="issues", blank=True)
    upvotes = models.IntegerField(default=0)

    def __str__(self):
        return self.title


class CouncilMember(models.Model):
    login = models.CharField(max_length=20, primary_key=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField()
    profile_picture = models.URLField()

    def __str__(self):
        return self.name
