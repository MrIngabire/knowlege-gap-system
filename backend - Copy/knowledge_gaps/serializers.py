from rest_framework import serializers
from .models import KnowledgeGap
from assessments.models import Question

class GapQuizQuestionSerializer(serializers.ModelSerializer):
    options = serializers.SerializerMethodField()

    class Meta:
        model = Question
        fields = ['id', 'question_text', 'options']

    def get_options(self, obj):
        return {
            'A': obj.option_a,
            'B': obj.option_b,
            'C': obj.option_c,
            'D': obj.option_d,
        }

class GapQuizSubmitSerializer(serializers.Serializer):
    gap_id = serializers.IntegerField()
    answers = serializers.ListField(
        child=serializers.DictField()
    )