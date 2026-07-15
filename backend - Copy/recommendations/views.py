from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import viewsets  # Add this import
from knowledge_gaps.models import KnowledgeGap
from .models import LearningResource
from .serializers import LearningResourceSerializer
from .services import get_recommendations

class RecommendationView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, student_id):
        gaps = KnowledgeGap.objects.filter(student_id=student_id)
        result = []
        for gap in gaps:
            resources = get_recommendations(gap)
            result.append({
                "gap_id": gap.id,
                "topic": gap.knowledge_area.name,
                "gap_status": gap.status,
                "resources": LearningResourceSerializer(resources, many=True).data
            })
        return Response(result)

# ADD THIS NEW CLASS
class LearningResourceViewSet(viewsets.ModelViewSet):
    """
    Handles GET, POST, PUT, DELETE for Learning Resources.
    """
    queryset = LearningResource.objects.all()
    serializer_class = LearningResourceSerializer
    permission_classes = [IsAuthenticated]