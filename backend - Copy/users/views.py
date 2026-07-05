from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import (
    IsAuthenticated
)

from .models import User

from .serializers import (
    UserRegistrationSerializer,
    UserProfileSerializer
)

class RegisterUserView(
    generics.CreateAPIView
):

    queryset = User.objects.all()

    serializer_class = (
        UserRegistrationSerializer
    )

class ProfileView(
    APIView
):

    permission_classes = [
        IsAuthenticated
    ]

    def get(
        self,
        request
    ):

        serializer = (
            UserProfileSerializer(
                request.user
            )
        )

        return Response(
            serializer.data
        )