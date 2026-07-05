from rest_framework.views import (
    APIView
)

from rest_framework.response import (
    Response
)

from assessments.models import (
    QuizAttempt
)

from knowledge_gaps.models import (
    KnowledgeGap
)

class StudentDashboardView(
    APIView
):

    def get(
        self,
        request,
        student_id
    ):

        attempts = (
            QuizAttempt.objects.filter(
                student_id=student_id
            )
        )

        gaps = (
            KnowledgeGap.objects.filter(
                student_id=student_id
            )
        )

        avg_score = 0

        if attempts.exists():

            avg_score = sum(
                a.score
                for a in attempts
            ) / attempts.count()

        return Response({

            "attempts":
            attempts.count(),

            "gaps":
            gaps.count(),

            "average_score":
            avg_score
        })
    
from users.models import User

from courses.models import (
    Course
)

from assessments.models import (
    Question
)

from recommendations.models import (
    LearningResource
)

class LecturerDashboardView(
    APIView
):

    def get(
        self,
        request
    ):

        return Response({

            "students":
            User.objects.filter(
                role="student"
            ).count(),

            "courses":
            Course.objects.count(),

            "questions":
            Question.objects.count(),

            "resources":
            LearningResource.objects.count(),
        })