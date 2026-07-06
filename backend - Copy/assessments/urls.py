from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    QuestionViewSet,
    QuizAttemptViewSet,
    StudentAnswerViewSet,
    SubmitQuizView,
)

router = DefaultRouter()
router.register('questions', QuestionViewSet)
router.register('quiz_attempts', QuizAttemptViewSet)
router.register('student_answers', StudentAnswerViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('submit-quiz/', SubmitQuizView.as_view(), name='submit-quiz'),  # ADD THIS
]