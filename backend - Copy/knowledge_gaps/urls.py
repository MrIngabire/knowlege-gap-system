from django.urls import path
from .views import GapQuizView, ClearGapView

urlpatterns = [
    path('gap-quiz/<int:gap_id>/', GapQuizView.as_view(), name='gap-quiz'),
    path('clear-gap/', ClearGapView.as_view(), name='clear-gap'),
]