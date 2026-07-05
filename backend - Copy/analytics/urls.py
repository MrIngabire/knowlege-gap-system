from django.urls import path

from .views import (
    StudentDashboardView,
    LecturerDashboardView
)

urlpatterns = [

    path(
        "dashboard/<int:student_id>/",
        StudentDashboardView.as_view()
    ),

    path(
        "lecturer/dashboard/",
        LecturerDashboardView.as_view()
    ),
]