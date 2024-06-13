from django.db import models

class Vote(models.Model):
    issue = models.ForeignKey("Issue", on_delete=models.CASCADE, related_name="votes")
    user_hash = models.CharField(max_length=64)

    class Meta:
        unique_together = ("issue", "user_hash")
    
    def __str__(self):
        return f"Vote for Issue #{self.issue.id} by {self.user_hash}"

class Comment(models.Model):
    id = models.AutoField(primary_key=True)
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    upvotes = models.IntegerField(default=0)

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