from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from users.permissions import IsLecturer, IsStudent
from users.models import User
from courses.models import Course, KnowledgeArea
from assessments.models import QuizAttempt, StudentAnswer, Question
from knowledge_gaps.models import KnowledgeGap
from recommendations.models import LearningResource
from collections import defaultdict, Counter


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
        return Response({
            "attempts": attempts.count(),
            "gaps": gaps.count(),
            "average_score": avg_score,
        })


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
        # Get all students (excluding lecturers)
        students = User.objects.filter(role="student")
        total_students = students.count()

        # Get all topics
        topics = KnowledgeArea.objects.all()
        
        # Calculate topic failure rates
        topic_failure_data = []
        
        for topic in topics:
            # Count students who have active gaps for this topic
            active_gaps_count = KnowledgeGap.objects.filter(
                knowledge_area=topic,
                status='active',
                student__in=students
            ).values('student').distinct().count()
            
            # Count students who have taken any quiz on this topic
            students_attempted = StudentAnswer.objects.filter(
                question__knowledge_area=topic,
                attempt__student__in=students
            ).values('attempt__student').distinct().count()
            
            # Calculate failure rate
            failure_rate = 0
            if students_attempted > 0:
                failure_rate = (active_gaps_count / total_students) * 100 if total_students > 0 else 0
            
            topic_failure_data.append({
                "id": topic.id,
                "name": topic.name,
                "course": topic.course.name,
                "course_id": topic.course.id,
                "students_with_gaps": active_gaps_count,
                "students_attempted": students_attempted,
                "total_students": total_students,
                "failure_rate": round(failure_rate, 1),
                "status": "high" if failure_rate > 30 else "medium" if failure_rate > 15 else "low"
            })

        # Sort by failure rate descending
        topic_failure_data.sort(key=lambda x: x['failure_rate'], reverse=True)

        # Get overall statistics
        total_gaps = KnowledgeGap.objects.filter(student__in=students, status='active').count()
        resolved_gaps = KnowledgeGap.objects.filter(student__in=students, status='resolved').count()
        
        # Get top 5 problematic topics
        top_problematic = topic_failure_data[:5]

        return Response({
            "students": total_students,
            "courses": Course.objects.count(),
            "questions": Question.objects.count(),
            "resources": LearningResource.objects.count(),
            "active_gaps": total_gaps,
            "resolved_gaps": resolved_gaps,
            "topics": topic_failure_data,
            "top_problematic": top_problematic,
        })