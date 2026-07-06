from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CourseViewSet, KnowledgeAreaViewSet

router = DefaultRouter()
router.register('courses', CourseViewSet, basename='course')
router.register('topics', KnowledgeAreaViewSet, basename='topic')

urlpatterns = [
    path('', include(router.urls)),
]