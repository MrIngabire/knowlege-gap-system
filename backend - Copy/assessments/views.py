from rest_framework import viewsets

from .models import (
    Question,
    QuizAttempt,
    StudentAnswer
)

from .serializers import (
    QuestionSerializer,
    QuizAttemptSerializer,
    StudentAnswerSerializer
)

class QuestionViewSet(
    viewsets.ModelViewSet
):

    queryset = (
        Question.objects.all()
    )

    serializer_class = (
        QuestionSerializer
    )

class QuizAttemptViewSet(
    viewsets.ModelViewSet
):

    queryset = (
        QuizAttempt.objects.all()
    )

    serializer_class = (
        QuizAttemptSerializer
    )

class StudentAnswerViewSet(
    viewsets.ModelViewSet
):

    queryset = (
        StudentAnswer.objects.all()
    )

    serializer_class = (
        StudentAnswerSerializer
    )

from rest_framework.views import APIView

from rest_framework.response import Response

from .serializers import (
    QuizSubmissionSerializer
)

from .services import (
    process_quiz_submission
)

class SubmitQuizView(
    APIView
):

    def post(self, request):

        serializer = (
            QuizSubmissionSerializer(
                data=request.data
            )
        )

        serializer.is_valid(
            raise_exception=True
        )

        attempt = (
            process_quiz_submission(
                serializer.validated_data[
                    "student_id"
                ],
                serializer.validated_data[
                    "answers"
                ]
            )
        )

        return Response({
            "score":
            attempt.score
        })
    

from rest_framework import viewsets

from .models import (
    Question
)

from .serializers import (
    QuestionSerializer
)

class QuestionViewSet(
    viewsets.ModelViewSet
):

    queryset = (
        Question.objects.all()
    )

    serializer_class = (
        QuestionSerializer
    )