from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ("id", "username", "email", "role", "is_staff", "program")
    list_filter = ("role", "is_staff")
    search_fields = ("username", "email", "phone")

    fieldsets = UserAdmin.fieldsets + (
        (
            "Additional Information",
            {
                "fields": (
                    "role",
                    "phone",
                    "program",
                )
            },
        ),
    )

    add_fieldsets = UserAdmin.add_fieldsets + (
        (
            "Additional Information",
            {
                "fields": (
                    "role",
                    "phone",
                    "program",
                )
            },
        ),
    )