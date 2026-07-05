from django.db import models
from django.conf import settings


class Course(models.Model):

    name = models.CharField(max_length=200)

    code = models.CharField(
        max_length=20,
        unique=True
    )

    lecturer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        limit_choices_to={'role': 'lecturer'}
    )

    def __str__(self):
        return self.name
    
class KnowledgeArea(models.Model):

    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name='topics'
    )

    name = models.CharField(max_length=200)

    description = models.TextField()

    def __str__(self):
        return self.name