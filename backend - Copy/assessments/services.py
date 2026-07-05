from .models import (
    Question,
    QuizAttempt,
    StudentAnswer
)

from users.models import User

from knowledge_gaps.services import (
    detect_gaps
)

def process_quiz_submission(
        student_id,
        answers
):

    student = User.objects.get(
        id=student_id
    )

    attempt = QuizAttempt.objects.create(
        student=student
    )

    correct_count = 0

    for item in answers:

        question = Question.objects.get(
            id=item["question_id"]
        )

        is_correct = (
            item["answer"]
            ==
            question.correct_answer
        )

        if is_correct:
            correct_count += 1

        StudentAnswer.objects.create(
            attempt=attempt,
            question=question,
            answer=item["answer"],
            is_correct=is_correct
        )

    total = len(answers)

    score = (
        correct_count / total
    ) * 100

    attempt.score = score
    attempt.save()

    detect_gaps(
        student,
        attempt
    )

    return attempt