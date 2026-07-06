from .models import LearningResource

def get_recommendations(gap):
    return LearningResource.objects.filter(knowledge_area=gap.knowledge_area).order_by("-id")