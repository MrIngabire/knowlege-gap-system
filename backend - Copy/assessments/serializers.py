from rest_framework import serializers

from .models import (
    Question,
    QuizAttempt,
    StudentAnswer
)
class QuestionSerializer(
    serializers.ModelSerializer
):

    topic_name = serializers.CharField(
        source="knowledge_area.name",
        read_only=True
    )

    class Meta:

        model = Question

        fields = "__all__"

class QuizAttemptSerializer(
    serializers.ModelSerializer
):

    class Meta:

        model = QuizAttempt

        fields = "__all__"

class StudentAnswerSerializer(
    serializers.ModelSerializer
):

    class Meta:

        model = StudentAnswer

        fields = "__all__"