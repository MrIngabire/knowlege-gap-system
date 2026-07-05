from django.core.management.base import BaseCommand

from faker import Faker
import random

from users.models import User
from courses.models import (
    Course,
    KnowledgeArea
)
from assessments.models import Question
from recommendations.models import LearningResource


fake = Faker()


class Command(BaseCommand):

    help = "Populate database with sample data"

    def handle(self, *args, **kwargs):

        self.stdout.write(
            self.style.SUCCESS(
                "Creating sample data..."
            )
        )

        # -----------------------
        # Lecturer
        # -----------------------

        lecturer, _ = User.objects.get_or_create(
            username="lecturer1",
            defaults={
                "email": "lecturer@test.com",
                "role": "lecturer",
            }
        )

        lecturer.set_password("password123")
        lecturer.save()

        # -----------------------
        # Students
        # -----------------------

        students = []

        for i in range(10):

            student, _ = User.objects.get_or_create(
                username=f"student{i}"
            )

            student.email = f"student{i}@test.com"
            student.role = "student"

            student.set_password(
                "password123"
            )

            student.save()

            students.append(student)

        # -----------------------
        # Courses
        # -----------------------

        courses = []

        course_data = [

            (
                "Programming Fundamentals",
                "PF101"
            ),

            (
                "Database Systems",
                "DB201"
            ),

            (
                "Web Development",
                "WD301"
            )

        ]

        for name, code in course_data:

            course, _ = Course.objects.get_or_create(
                name=name,
                code=code,
                lecturer=lecturer
            )

            courses.append(course)

        # -----------------------
        # Topics
        # -----------------------

        topic_map = {

            "Programming Fundamentals": [

                "Variables",
                "Data Types",
                "Loops",
                "Functions",
                "OOP"

            ],

            "Database Systems": [

                "ERD",
                "Normalization",
                "SQL",
                "Indexes",
                "Transactions"

            ],

            "Web Development": [

                "HTML",
                "CSS",
                "JavaScript",
                "React",
                "APIs"

            ]

        }

        topics = []

        for course in courses:

            for topic_name in topic_map[
                course.name
            ]:

                topic, _ = (
                    KnowledgeArea.objects
                    .get_or_create(
                        course=course,
                        name=topic_name,
                        defaults={
                            "description":
                            f"{topic_name} concepts"
                        }
                    )
                )

                topics.append(topic)

        # -----------------------
        # Questions
        # -----------------------

        for topic in topics:

            for i in range(10):

                Question.objects.get_or_create(

                    question_text=
                    f"What is {topic.name}? Question {i+1}",

                    knowledge_area=topic,

                    defaults={

                        "option_a": "Option A",

                        "option_b": "Option B",

                        "option_c": "Option C",

                        "option_d": "Option D",

                        "correct_answer":
                        random.choice(
                            ["A", "B", "C", "D"]
                        )
                    }
                )

        # -----------------------
        # Resources
        # -----------------------

        for topic in topics:

            LearningResource.objects.get_or_create(

                title=
                f"{topic.name} PDF Guide",

                knowledge_area=topic,

                defaults={

                    "resource_type":
                    "pdf",

                    "url":
                    "https://example.com/resource"
                }
            )

            LearningResource.objects.get_or_create(

                title=
                f"{topic.name} Video Lesson",

                knowledge_area=topic,

                defaults={

                    "resource_type":
                    "video",

                    "url":
                    "https://youtube.com"
                }
            )

        self.stdout.write(
            self.style.SUCCESS(
                "Database seeded successfully!"
            )
        )