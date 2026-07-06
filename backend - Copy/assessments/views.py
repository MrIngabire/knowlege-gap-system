import csv
import json
from io import TextIOWrapper

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from users.permissions import IsLecturer
from courses.models import Course, KnowledgeArea
from .models import Question, QuizAttempt, StudentAnswer
from .serializers import (
    QuestionSerializer,
    QuizAttemptSerializer,
    StudentAnswerSerializer,
    QuizSubmissionSerializer,
    AttemptDetailSerializer,
)
from .services import process_quiz_submission


class QuestionViewSet(viewsets.ModelViewSet):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [IsAuthenticated]
        else:
            permission_classes = [IsAuthenticated, IsLecturer]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        queryset = super().get_queryset()
        course_id = self.request.query_params.get('course')
        topic_id = self.request.query_params.get('topic')
        if course_id:
            queryset = queryset.filter(knowledge_area__course_id=course_id)
        if topic_id:
            queryset = queryset.filter(knowledge_area_id=topic_id)
        return queryset

    @action(detail=False, methods=['post'])
    def bulk_create(self, request):
        """
        Accept a list of question objects and create them all.
        Expected payload: { "questions": [ {...}, {...} ] }
        """
        serializer = QuestionSerializer(data=request.data.get('questions', []), many=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], parser_classes=[MultiPartParser])
    def import_questions(self, request):
        file = request.FILES.get('file')
        if not file:
            return Response({"error": "No file provided"}, status=status.HTTP_400_BAD_REQUEST)

        filename = file.name.lower()
        required_fields = ['course_id', 'topic_name', 'question_text', 'option_a', 'option_b', 'option_c', 'option_d', 'correct_answer']
        questions = []
        errors = []

        if filename.endswith('.csv'):
            try:
                reader = csv.DictReader(TextIOWrapper(file, encoding='utf-8'))
                for idx, row in enumerate(reader, start=1):
                    missing = [f for f in required_fields if not row.get(f)]
                    if missing:
                        errors.append(f"Row {idx}: missing fields: {', '.join(missing)}")
                        continue
                    if row['correct_answer'].upper() not in ['A','B','C','D']:
                        errors.append(f"Row {idx}: invalid correct_answer '{row['correct_answer']}'. Must be A, B, C, or D.")
                        continue
                    try:
                        course_id = int(row['course_id'])
                        topic_name = row['topic_name'].strip()
                        topic, created = KnowledgeArea.objects.get_or_create(
                            course_id=course_id,
                            name=topic_name,
                            defaults={'description': f"{topic_name} – imported"}
                        )
                        row['knowledge_area'] = topic.id
                        questions.append(row)
                    except (Course.DoesNotExist, ValueError):
                        errors.append(f"Row {idx}: course with ID '{row['course_id']}' not found.")
                        continue
            except Exception as e:
                return Response({"error": f"CSV parsing error: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

        elif filename.endswith('.json'):
            try:
                data = json.load(file)
                if isinstance(data, dict) and 'questions' in data:
                    data = data['questions']
                elif not isinstance(data, list):
                    return Response({"error": "JSON must be an array or object with 'questions' key"}, status=status.HTTP_400_BAD_REQUEST)
                for idx, q in enumerate(data, start=1):
                    missing = [f for f in required_fields if f not in q]
                    if missing:
                        errors.append(f"Item {idx}: missing fields: {', '.join(missing)}")
                        continue
                    if q['correct_answer'].upper() not in ['A','B','C','D']:
                        errors.append(f"Item {idx}: invalid correct_answer")
                        continue
                    try:
                        course_id = int(q['course_id'])
                        topic_name = q['topic_name'].strip()
                        topic, created = KnowledgeArea.objects.get_or_create(
                            course_id=course_id,
                            name=topic_name,
                            defaults={'description': f"{topic_name} – imported"}
                        )
                        q['knowledge_area'] = topic.id
                        questions.append(q)
                    except (Course.DoesNotExist, ValueError):
                        errors.append(f"Item {idx}: course with ID '{q['course_id']}' not found.")
                        continue
            except json.JSONDecodeError as e:
                return Response({"error": f"Invalid JSON: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({"error": "Unsupported file format. Use .csv or .json."}, status=status.HTTP_400_BAD_REQUEST)

        if errors:
            return Response({"errors": errors}, status=status.HTTP_400_BAD_REQUEST)

        serializer = QuestionSerializer(data=questions, many=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"created": len(questions)}, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class QuizAttemptViewSet(viewsets.ModelViewSet):
    queryset = QuizAttempt.objects.all()
    serializer_class = QuizAttemptSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'student':
            return QuizAttempt.objects.filter(student=user)
        return QuizAttempt.objects.all()

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        if request.user.role == 'student' and instance.student.id != request.user.id:
            return Response({"error": "You are not allowed to view this attempt."}, status=status.HTTP_403_FORBIDDEN)
        serializer = AttemptDetailSerializer(instance)
        return Response(serializer.data)


class StudentAnswerViewSet(viewsets.ModelViewSet):
    queryset = StudentAnswer.objects.all()
    serializer_class = StudentAnswerSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'student':
            return StudentAnswer.objects.filter(attempt__student=user)
        return StudentAnswer.objects.all()


from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from .serializers import QuizSubmissionSerializer
from .services import process_quiz_submission


class SubmitQuizView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = QuizSubmissionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        student_id = serializer.validated_data['student_id']
        if request.user.role == 'student' and request.user.id != student_id:
            return Response(
                {"error": "You can only submit quizzes for yourself"},
                status=status.HTTP_403_FORBIDDEN
            )

        attempt = process_quiz_submission(
            student_id,
            serializer.validated_data['answers']
        )

        return Response({
            "score": attempt.score
        })