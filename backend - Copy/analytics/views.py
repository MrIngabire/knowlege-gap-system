from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from users.permissions import IsLecturer, IsStudent
from users.models import User
from courses.models import Course, KnowledgeArea
from assessments.models import QuizAttempt, StudentAnswer, Question
from knowledge_gaps.models import KnowledgeGap
from recommendations.models import LearningResource
from collections import defaultdict

class StudentDashboardView(APIView):
    permission_classes = [IsAuthenticated, IsStudent]

    def get(self, request, student_id):
        if request.user.id != student_id and request.user.role != 'lecturer':
            return Response({"error": "Unauthorized"}, status=403)
        attempts = QuizAttempt.objects.filter(student_id=student_id)
        gaps = KnowledgeGap.objects.filter(student_id=student_id)
        avg_score = 0
        if attempts.exists():
            avg_score = sum(a.score for a in attempts) / attempts.count()
        return Response({"attempts": attempts.count(), "gaps": gaps.count(), "average_score": avg_score})

class AttemptHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, student_id):
        if request.user.id != student_id and request.user.role != 'lecturer':
            return Response({"error": "Unauthorized"}, status=403)
        attempts = QuizAttempt.objects.filter(student_id=student_id).order_by('-created_at')
        history = []
        for attempt in attempts:
            answers = StudentAnswer.objects.filter(attempt=attempt).select_related('question__knowledge_area')
            topic_stats = defaultdict(lambda: {'correct': 0, 'total': 0, 'name': ''})
            for ans in answers:
                topic = ans.question.knowledge_area
                topic_stats[topic.id]['total'] += 1
                if ans.is_correct:
                    topic_stats[topic.id]['correct'] += 1
                topic_stats[topic.id]['name'] = topic.name
            gaps = []
            for topic_id, data in topic_stats.items():
                if data['total'] > 0:
                    pct = (data['correct'] / data['total']) * 100
                    if pct < 60:
                        gaps.append(data['name'])
            score = round(attempt.score)
            if score >= 80:
                result = "Proficient"
            elif score >= 60:
                result = "Developing"
            else:
                result = "Needs Improvement"
            history.append({
                "id": attempt.id,
                "date": attempt.created_at.strftime("%b %d, %Y"),
                "score": score,
                "result": result,
                "gaps": gaps,
            })
        return Response(history)

class LecturerDashboardView(APIView):
    permission_classes = [IsAuthenticated, IsLecturer]

    def get(self, request):
        return Response({
            "students": User.objects.filter(role="student").count(),
            "courses": Course.objects.count(),
            "questions": Question.objects.count(),
            "resources": LearningResource.objects.count(),
        })