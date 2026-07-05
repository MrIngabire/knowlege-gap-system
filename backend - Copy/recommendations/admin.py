from django.contrib import admin

from .models import LearningResource

@admin.register(LearningResource)
class LearningResourceAdmin(
    admin.ModelAdmin
):

    list_display = (
        "id",
        "title",
        "resource_type",
        "knowledge_area"
    )

    list_filter = (
        "resource_type",
        "knowledge_area"
    )

    search_fields = (
        "title",
    )

