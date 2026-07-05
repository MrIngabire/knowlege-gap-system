from django.db import models
from courses.models import KnowledgeArea


class LearningResource(models.Model):

    RESOURCE_TYPES = (
        ('pdf', 'PDF'),
        ('video', 'Video'),
        ('article', 'Article'),
    )

    title = models.CharField(max_length=255)

    resource_type = models.CharField(
        max_length=20,
        choices=RESOURCE_TYPES
    )

    file = models.FileField(
        upload_to='resources/',
        blank=True,
        null=True
    )

    url = models.URLField(
        blank=True,
        null=True
    )

    knowledge_area = models.ForeignKey(
        KnowledgeArea,
        on_delete=models.CASCADE
    )

    def __str__(self):
        return self.title