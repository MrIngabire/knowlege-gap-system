from django.contrib import admin

from .models import (
    Question,
    QuizAttempt,
    StudentAnswer
)

@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "short_question",
        "knowledge_area",
        "correct_answer"
    )

    def short_question(self, obj):
        return obj.question_text[:60]
    
@admin.register(QuizAttempt)
class QuizAttemptAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "student",
        "score",
        "created_at"
    )

    list_filter = (
        "created_at",
    )

@admin.register(StudentAnswer)
class StudentAnswerAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "attempt",
        "question",
        "answer",
        "is_correct"
    )

    list_filter = (
        "is_correct",
    )