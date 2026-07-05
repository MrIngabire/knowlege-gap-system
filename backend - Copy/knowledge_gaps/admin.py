from django.contrib import admin

from .models import KnowledgeGap

@admin.register(KnowledgeGap)
class KnowledgeGapAdmin(
    admin.ModelAdmin
):

    list_display = (
        "id",
        "student",
        "knowledge_area",
        "score",
        "detected_at"
    )

    list_filter = (
        "knowledge_area",
    )