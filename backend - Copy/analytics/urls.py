from django.urls import path
from .views import (
    StudentDashboardView,
    LecturerDashboardView,
    AttemptHistoryView,
    StudentAnalyticsView,
)

urlpatterns = [
    path(
        "dashboard/<int:student_id>/",
        StudentDashboardView.as_view(),
        name="student-dashboard"
    ),
    path(
        "lecturer/dashboard/",
        LecturerDashboardView.as_view(),
        name="lecturer-dashboard"
    ),
    path(
        "attempts/<int:student_id>/",
        AttemptHistoryView.as_view(),
        name="attempt-history"
    ),
    path(
        "analytics/",
        StudentAnalyticsView.as_view(),
        name="student-analytics"
    ),
]