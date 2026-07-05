from rest_framework import serializers

from .models import KnowledgeGap


class KnowledgeGapSerializer(
    serializers.ModelSerializer
):

    topic_name = serializers.CharField(
        source="knowledge_area.name",
        read_only=True
    )

    class Meta:

        model = KnowledgeGap

        fields = "__all__"