from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from users.permissions import IsLecturer
from .models import Course, KnowledgeArea
from .serializers import CourseSerializer, KnowledgeAreaSerializer


class CourseViewSet(viewsets.ModelViewSet):
    serializer_class = CourseSerializer
    queryset = Course.objects.all()

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        return [IsAuthenticated(), IsLecturer()]

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated and user.role == 'lecturer':
            return Course.objects.filter(lecturer=user)
        return Course.objects.all()

    def perform_create(self, serializer):
        serializer.save(lecturer=self.request.user)


class KnowledgeAreaViewSet(viewsets.ModelViewSet):
    serializer_class = KnowledgeAreaSerializer
    queryset = KnowledgeArea.objects.all()

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        return [IsAuthenticated(), IsLecturer()]

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated and user.role == 'lecturer':
            return KnowledgeArea.objects.filter(course__lecturer=user)
        return KnowledgeArea.objects.all()