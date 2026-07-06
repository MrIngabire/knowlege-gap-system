from django.db import models
from django.conf import settings
from courses.models import KnowledgeArea

class KnowledgeGap(models.Model):
    STATUS_CHOICES = (
        ('active', 'Active'),
        ('resolved', 'Resolved'),
    )

    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    knowledge_area = models.ForeignKey(KnowledgeArea, on_delete=models.CASCADE)
    score = models.FloatField()
    detected_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    resolved_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.student} - {self.knowledge_area} ({self.status})"