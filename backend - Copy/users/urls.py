from django.urls import path

from .views import (
    RegisterUserView,
    ProfileView
)

urlpatterns = [

    path(
        "register/",
        RegisterUserView.as_view()
    ),

    path(
        "profile/",
        ProfileView.as_view()
    ),
]