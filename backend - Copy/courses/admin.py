from django.contrib import admin

from .models import (
    Course,
    KnowledgeArea
)


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "name",
        "code",
        "lecturer"
    )

    search_fields = (
        "name",
        "code"
    )


@admin.register(KnowledgeArea)
class KnowledgeAreaAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "name",
        "course"
    )

    search_fields = (
        "name",
    )

    list_filter = (
        "course",
    )