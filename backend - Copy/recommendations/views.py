from django.shortcuts import render

# Create your views here.
from rest_framework.views import (
    APIView
)

from rest_framework.response import (
    Response
)

from knowledge_gaps.models import (
    KnowledgeGap
)

from .serializers import (
    LearningResourceSerializer
)

from .services import (
    get_recommendations
)

class RecommendationView(
    APIView
):

    def get(
        self,
        request,
        student_id
    ):

        gaps = (
            KnowledgeGap.objects.filter(
                student_id=student_id
            )
        )

        result = []

        for gap in gaps:

            resources = (
                get_recommendations(gap)
            )

            result.append({
                "topic":
                gap.knowledge_area.name,

                "resources":
                LearningResourceSerializer(
                    resources,
                    many=True
                ).data
            })

        return Response(result)