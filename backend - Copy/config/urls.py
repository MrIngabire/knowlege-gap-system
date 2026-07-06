from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/users/", include("users.urls")),
    path("api/token/", TokenObtainPairView.as_view()),
    path("api/token/refresh/", TokenRefreshView.as_view()),
    path("api/", include("courses.urls")),
    path("api/", include("assessments.urls")),
    path("api/", include("recommendations.urls")),
    path("api/", include("analytics.urls")),
    # Add this line
    path("api/", include("knowledge_gaps.urls")),
]