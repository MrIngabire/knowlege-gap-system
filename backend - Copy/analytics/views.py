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
    """Get student dashboard stats (attempts, gaps, average score)"""
    permission_classes = [IsAuthenticated, IsStudent]

    def get(self, request, student_id):
        if request.user.id != student_id and request.user.role != 'lecturer':
            return Response({"error": "Unauthorized"}, status=403)
        
        attempts = QuizAttempt.objects.filter(student_id=student_id)
        gaps = KnowledgeGap.objects.filter(student_id=student_id, status='active')
        
        avg_score = 0
        if attempts.exists():
            avg_score = sum(a.score for a in attempts) / attempts.count()
        
        return Response({
            "attempts": attempts.count(),
            "gaps": gaps.count(),
            "average_score": round(avg_score, 1),
        })


class AttemptHistoryView(APIView):
    """Get student attempt history with gap detection per attempt"""
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


class StudentAnalyticsView(APIView):
    """Get comprehensive analytics for a student (topic performance, trends, summary)"""
    permission_classes = [IsAuthenticated, IsStudent]

    def get(self, request):
        student = request.user
        
        # Get all attempts for this student
        attempts = QuizAttempt.objects.filter(student=student).order_by('created_at')
        
        # Get all gaps for this student
        gaps = KnowledgeGap.objects.filter(student=student)
        
        # --- Topic Performance ---
        topic_scores = defaultdict(lambda: {'correct': 0, 'total': 0, 'name': ''})
        
        for attempt in attempts:
            answers = StudentAnswer.objects.filter(attempt=attempt).select_related('question__knowledge_area')
            for answer in answers:
                topic = answer.question.knowledge_area
                topic_scores[topic.id]['total'] += 1
                if answer.is_correct:
                    topic_scores[topic.id]['correct'] += 1
                topic_scores[topic.id]['name'] = topic.name
        
        # Calculate percentage per topic
        topic_performance = []
        for topic_id, data in topic_scores.items():
            if data['total'] > 0:
                pct = (data['correct'] / data['total']) * 100
                topic_performance.append({
                    'topic': data['name'],
                    'score': round(pct, 1),
                    'correct': data['correct'],
                    'total': data['total'],
                    'gap': pct < 60
                })
        
        topic_performance.sort(key=lambda x: x['score'])
        
        # --- Score Trend ---
        trend_data = []
        for attempt in attempts.order_by('-created_at')[:10]:
            trend_data.append({
                'date': attempt.created_at.strftime('%b %d, %Y'),
                'score': round(attempt.score, 1),
                'attempt_id': attempt.id
            })
        trend_data.reverse()
        
        # --- Summary Stats ---
        total_attempts = attempts.count()
        total_gaps = gaps.filter(status='active').count()
        resolved_gaps = gaps.filter(status='resolved').count()
        
        avg_score = 0
        if total_attempts > 0:
            avg_score = sum(a.score for a in attempts) / total_attempts
        
        best_score = 0
        best_score_date = None
        if attempts.exists():
            best_attempt = attempts.order_by('-score').first()
            best_score = round(best_attempt.score, 1)
            best_score_date = best_attempt.created_at.strftime('%b %d, %Y')
        
        return Response({
            'topic_performance': topic_performance,
            'trend_data': trend_data,
            'summary': {
                'total_attempts': total_attempts,
                'average_score': round(avg_score, 1),
                'best_score': best_score,
                'best_score_date': best_score_date,
                'active_gaps': total_gaps,
                'resolved_gaps': resolved_gaps,
            }
        })


class LecturerDashboardView(APIView):
    """Get lecturer dashboard stats with cohort analytics"""
    permission_classes = [IsAuthenticated, IsLecturer]

    def get(self, request):
        students = User.objects.filter(role="student")
        total_students = students.count()
        
        topics = KnowledgeArea.objects.all()
        
        # Calculate topic failure rates
        topic_failure_data = []
        
        for topic in topics:
            active_gaps_count = KnowledgeGap.objects.filter(
                knowledge_area=topic,
                status='active',
                student__in=students
            ).values('student').distinct().count()
            
            students_attempted = StudentAnswer.objects.filter(
                question__knowledge_area=topic,
                attempt__student__in=students
            ).values('attempt__student').distinct().count()
            
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

        topic_failure_data.sort(key=lambda x: x['failure_rate'], reverse=True)

        total_gaps = KnowledgeGap.objects.filter(student__in=students, status='active').count()
        resolved_gaps = KnowledgeGap.objects.filter(student__in=students, status='resolved').count()
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