from .models import KnowledgeGap

def detect_gaps(student, attempt):
    topic_scores = {}
    answers = attempt.studentanswer_set.all()

    for answer in answers:
        topic = answer.question.knowledge_area
        if topic.id not in topic_scores:
            topic_scores[topic.id] = {'topic': topic, 'correct': 0, 'total': 0}
        topic_scores[topic.id]['total'] += 1
        if answer.is_correct:
            topic_scores[topic.id]['correct'] += 1

    for item in topic_scores.values():
        percentage = (item['correct'] / item['total']) * 100
        if percentage < 60:
            gap, created = KnowledgeGap.objects.update_or_create(
                student=student,
                knowledge_area=item['topic'],
                defaults={
                    'score': percentage,
                    'status': 'active'  # Reset to active if it was resolved
                }
            )