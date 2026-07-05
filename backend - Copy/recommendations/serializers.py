from rest_framework import serializers

from .models import LearningResource


class LearningResourceSerializer(
    serializers.ModelSerializer
):

    topic_name = serializers.CharField(
        source="knowledge_area.name",
        read_only=True
    )

    class Meta:

        model = LearningResource

        fields = "__all__"