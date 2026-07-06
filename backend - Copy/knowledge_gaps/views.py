from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from .models import KnowledgeGap
from .serializers import GapQuizQuestionSerializer, GapQuizSubmitSerializer
from assessments.models import Question


class GapQuizView(APIView):
    """Get 3 random questions for a specific gap topic"""
    permission_classes = [IsAuthenticated]

    def get(self, request, gap_id):
        gap = get_object_or_404(KnowledgeGap, id=gap_id, student=request.user)

        # Get all questions for this knowledge area
        questions = Question.objects.filter(knowledge_area=gap.knowledge_area)

        if questions.count() < 3:
            return Response(
                {"error": "Not enough questions available for this topic. Need at least 3."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Randomly select 3 questions
        import random
        selected = random.sample(list(questions), 3)

        serializer = GapQuizQuestionSerializer(selected, many=True)
        return Response({
            "gap_id": gap.id,
            "topic": gap.knowledge_area.name,
            "questions": serializer.data
        })


class ClearGapView(APIView):
    """Submit answers for gap quiz and update status if passed"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = GapQuizSubmitSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        gap_id = serializer.validated_data['gap_id']
        answers_data = serializer.validated_data['answers']

        gap = get_object_or_404(KnowledgeGap, id=gap_id, student=request.user)

        if gap.status == 'resolved':
            return Response(
                {"error": "This gap has already been resolved."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check answers
        correct_count = 0
        results = []

        for item in answers_data:
            question = get_object_or_404(Question, id=item['question_id'])
            is_correct = item['answer'] == question.correct_answer
            if is_correct:
                correct_count += 1
            results.append({
                'question_id': question.id,
                'correct': is_correct,
                'correct_answer': question.correct_answer,
                'your_answer': item['answer']
            })

        total = len(answers_data)
        score = (correct_count / total) * 100

        # Pass if score >= 60% (2 out of 3 correct)
        passed = score >= 60

        if passed:
            gap.status = 'resolved'
            gap.resolved_at = timezone.now()
            gap.save()
            message = "🎉 Congratulations! You've cleared this knowledge gap!"
        else:
            message = f"❌ You scored {score}%. You need at least 60% to clear this gap. Try again!"

        return Response({
            "passed": passed,
            "score": score,
            "message": message,
            "results": results
        })