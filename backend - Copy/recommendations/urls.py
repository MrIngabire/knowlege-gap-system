from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    RecommendationView,
    LearningResourceViewSet  # Add this import
)

# Create a router and register our resource viewset
router = DefaultRouter()
router.register(r'resources', LearningResourceViewSet, basename='resource')

urlpatterns = [
    path(
        "recommendations/<int:student_id>/",
        RecommendationView.as_view()
    ),
    # Add the router URLs to your patterns
    path("", include(router.urls)),
]