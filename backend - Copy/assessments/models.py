from django.db import models
from courses.models import KnowledgeArea
from django.conf import settings

class Question(models.Model):
    knowledge_area = models.ForeignKey(KnowledgeArea, on_delete=models.CASCADE)
    question_text = models.TextField()
    option_a = models.CharField(max_length=255)
    option_b = models.CharField(max_length=255)
    option_c = models.CharField(max_length=255)
    option_d = models.CharField(max_length=255)
    correct_answer = models.CharField(max_length=1)

    def __str__(self):
        return self.question_text[:50]

class QuizAttempt(models.Model):
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    score = models.FloatField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

class StudentAnswer(models.Model):
    attempt = models.ForeignKey(QuizAttempt, on_delete=models.CASCADE)
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    answer = models.CharField(max_length=1)
    is_correct = models.BooleanField(default=False)