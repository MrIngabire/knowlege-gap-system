from rest_framework import serializers

from .models import (
    Course,
    KnowledgeArea
)


class CourseSerializer(
    serializers.ModelSerializer
):

    class Meta:

        model = Course

        fields = "__all__"


class KnowledgeAreaSerializer(
    serializers.ModelSerializer
):

    course_name = serializers.CharField(
        source="course.name",
        read_only=True
    )

    class Meta:

        model = KnowledgeArea

        fields = "__all__"