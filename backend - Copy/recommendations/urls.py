from django.urls import path

from .views import (
    RecommendationView
)

urlpatterns = [

    path(
        "recommendations/<int:student_id>/",
        RecommendationView.as_view()
    )
]