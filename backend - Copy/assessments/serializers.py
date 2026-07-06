from rest_framework import serializers
from .models import Question, QuizAttempt, StudentAnswer

class QuestionSerializer(serializers.ModelSerializer):
    topic_name = serializers.CharField(source="knowledge_area.name", read_only=True)
    class Meta:
        model = Question
        fields = "__all__"

class QuizAttemptSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizAttempt
        fields = "__all__"

class StudentAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentAnswer
        fields = "__all__"

class QuizSubmissionSerializer(serializers.Serializer):
    student_id = serializers.IntegerField()
    answers = serializers.ListField(child=serializers.DictField())

class StudentAnswerDetailSerializer(serializers.ModelSerializer):
    question_text = serializers.CharField(source='question.question_text')
    correct_answer = serializers.CharField(source='question.correct_answer')
    options = serializers.SerializerMethodField()

    class Meta:
        model = StudentAnswer
        fields = ['question_text', 'answer', 'is_correct', 'correct_answer', 'options']

    def get_options(self, obj):
        return {
            'A': obj.question.option_a,
            'B': obj.question.option_b,
            'C': obj.question.option_c,
            'D': obj.question.option_d,
        }

class AttemptDetailSerializer(serializers.ModelSerializer):
    answers = StudentAnswerDetailSerializer(source='studentanswer_set', many=True)
    student_name = serializers.CharField(source='student.username', read_only=True)

    class Meta:
        model = QuizAttempt
        fields = ['id', 'student', 'student_name', 'score', 'created_at', 'answers']

from rest_framework import serializers

class QuizSubmissionSerializer(serializers.Serializer):
    student_id = serializers.IntegerField()
    answers = serializers.ListField(
        child=serializers.DictField()
    )