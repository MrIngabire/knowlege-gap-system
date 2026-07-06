import random
from django.core.management.base import BaseCommand, CommandParser
from django.db import transaction
from faker import Faker

from users.models import User
from courses.models import Course, KnowledgeArea
from assessments.models import Question, QuizAttempt, StudentAnswer
from recommendations.models import LearningResource
from knowledge_gaps.services import detect_gaps

fake = Faker()

# ------------------------------------------------------------
# Knowledge base: topic concepts (correct definition + distractors)
# ------------------------------------------------------------
CONCEPT_DB = {
    "Variables": {
        "correct": "A named storage location that holds a value.",
        "distractors": [
            "A function that returns a value.",
            "A loop that iterates over data.",
            "A conditional statement that evaluates logic."
        ]
    },
    "Data Types": {
        "correct": "A classification that specifies which type of value a variable can hold.",
        "distractors": [
            "A structure that stores multiple values.",
            "A method that converts data.",
            "A function that validates input."
        ]
    },
    "Loops": {
        "correct": "A control structure that repeats a block of code multiple times.",
        "distractors": [
            "A decision structure that branches code.",
            "A data structure that stores elements.",
            "An operation that performs arithmetic."
        ]
    },
    "Functions": {
        "correct": "A reusable block of code that performs a specific task.",
        "distractors": [
            "A variable that stores a value.",
            "A loop that iterates over a list.",
            "A condition that checks equality."
        ]
    },
    "OOP": {
        "correct": "A programming paradigm based on objects that contain data and methods.",
        "distractors": [
            "A style that focuses on sequential instructions.",
            "A methodology that prioritizes data flow.",
            "A pattern that uses pure functions."
        ]
    },
    "ERD": {
        "correct": "A diagram that shows relationships between entities in a database.",
        "distractors": [
            "A chart that displays system architecture.",
            "A layout of user interface components.",
            "A diagram of network topology."
        ]
    },
    "Normalization": {
        "correct": "The process of organizing data to reduce redundancy and improve integrity.",
        "distractors": [
            "A technique to compress database size.",
            "A method to encrypt sensitive data.",
            "A strategy to speed up queries."
        ]
    },
    "SQL": {
        "correct": "A language used to manage and query relational databases.",
        "distractors": [
            "A language for building web pages.",
            "A framework for mobile development.",
            "A protocol for network communication."
        ]
    },
    "Indexes": {
        "correct": "Data structures that improve the speed of data retrieval operations.",
        "distractors": [
            "Security measures that prevent unauthorized access.",
            "Backup copies of database files.",
            "Logs that track user activity."
        ]
    },
    "Transactions": {
        "correct": "A sequence of operations performed as a single logical unit of work.",
        "distractors": [
            "A set of database constraints.",
            "A type of stored procedure.",
            "A method for data migration."
        ]
    },
    "HTML": {
        "correct": "The standard markup language for creating web pages.",
        "distractors": [
            "A programming language for back‑end logic.",
            "A style language for formatting web pages.",
            "A scripting language for dynamic content."
        ]
    },
    "CSS": {
        "correct": "A style sheet language used for describing the presentation of a document.",
        "distractors": [
            "A language for creating interactive web applications.",
            "A database query language.",
            "A server‑side scripting language."
        ]
    },
    "JavaScript": {
        "correct": "A scripting language that enables dynamic behavior on web pages.",
        "distractors": [
            "A markup language for structuring web content.",
            "A framework for building mobile apps.",
            "A language for styling web pages."
        ]
    },
    "React": {
        "correct": "A JavaScript library for building user interfaces.",
        "distractors": [
            "A back‑end framework for Node.js.",
            "A database management system.",
            "A CSS preprocessor."
        ]
    },
    "APIs": {
        "correct": "A set of rules that allows different software applications to communicate.",
        "distractors": [
            "A user interface design system.",
            "A version control tool.",
            "A cloud hosting service."
        ]
    },
    "SDLC": {
        "correct": "The Software Development Life Cycle – a process for planning, creating, testing, and deploying software.",
        "distractors": [
            "A programming language.",
            "A database design methodology.",
            "A testing framework."
        ]
    },
    "Agile": {
        "correct": "An iterative approach to software development that emphasizes flexibility and customer feedback.",
        "distractors": [
            "A project management tool.",
            "A design pattern.",
            "A type of database."
        ]
    },
    "Testing": {
        "correct": "The process of evaluating software to identify bugs and ensure it meets requirements.",
        "distractors": [
            "A coding standard.",
            "A deployment strategy.",
            "A version control technique."
        ]
    },
    "Design Patterns": {
        "correct": "Reusable solutions to common software design problems.",
        "distractors": [
            "A type of database schema.",
            "A programming language feature.",
            "A testing framework."
        ]
    },
    "Version Control": {
        "correct": "A system that records changes to files over time, allowing collaboration and rollback.",
        "distractors": [
            "A package manager.",
            "A continuous integration tool.",
            "A code editor."
        ]
    },
    "Arrays": {
        "correct": "A data structure that stores a fixed‑size sequential collection of elements of the same type.",
        "distractors": [
            "A dynamic collection of objects.",
            "A key‑value storage.",
            "A tree structure."
        ]
    },
    "Linked Lists": {
        "correct": "A linear data structure where each element points to the next.",
        "distractors": [
            "A data structure that stores key‑value pairs.",
            "A tree where each node has children.",
            "A fixed‑size array."
        ]
    },
    "Stacks": {
        "correct": "A LIFO (Last‑In‑First‑Out) data structure.",
        "distractors": [
            "A FIFO (First‑In‑First‑Out) structure.",
            "A tree structure.",
            "A hash table."
        ]
    },
    "Queues": {
        "correct": "A FIFO (First‑In‑First‑Out) data structure.",
        "distractors": [
            "A LIFO structure.",
            "A tree structure.",
            "A hash table."
        ]
    },
    "Trees": {
        "correct": "A hierarchical data structure with a root node and child nodes.",
        "distractors": [
            "A linear data structure.",
            "A hash table.",
            "A set of key‑value pairs."
        ]
    }
}

# ------------------------------------------------------------
# Real learning resources (external links)
# ------------------------------------------------------------
REAL_RESOURCES = {
    "Variables": [
        {"title": "MDN: Variables", "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Grammar_and_types#variables", "type": "article"},
        {"title": "W3Schools: Python Variables", "url": "https://www.w3schools.com/python/python_variables.asp", "type": "article"},
        {"title": "YouTube: Variables Explained", "url": "https://www.youtube.com/results?search_query=programming+variables+explained", "type": "video"},
    ],
    "Data Types": [
        {"title": "MDN: Data Types", "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures", "type": "article"},
        {"title": "Real Python: Data Types", "url": "https://realpython.com/python-data-types/", "type": "article"},
        {"title": "YouTube: Data Types", "url": "https://www.youtube.com/results?search_query=python+data+types", "type": "video"},
    ],
    "Loops": [
        {"title": "MDN: Loops", "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Loops_and_iteration", "type": "article"},
        {"title": "W3Schools: Loops", "url": "https://www.w3schools.com/python/python_while_loops.asp", "type": "article"},
        {"title": "YouTube: Loops Tutorial", "url": "https://www.youtube.com/results?search_query=programming+loops+tutorial", "type": "video"},
    ],
    "Functions": [
        {"title": "MDN: Functions", "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions", "type": "article"},
        {"title": "W3Schools: Functions", "url": "https://www.w3schools.com/python/python_functions.asp", "type": "article"},
        {"title": "YouTube: Functions Tutorial", "url": "https://www.youtube.com/results?search_query=python+functions+tutorial", "type": "video"},
    ],
    "OOP": [
        {"title": "MDN: OOP", "url": "https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Objects", "type": "article"},
        {"title": "Real Python: OOP", "url": "https://realpython.com/python3-object-oriented-programming/", "type": "article"},
        {"title": "YouTube: OOP Tutorial", "url": "https://www.youtube.com/results?search_query=python+oop+tutorial", "type": "video"},
    ],
    "ERD": [
        {"title": "Lucidchart: ERD Guide", "url": "https://www.lucidchart.com/pages/er-diagrams", "type": "article"},
        {"title": "YouTube: ERD Tutorial", "url": "https://www.youtube.com/results?search_query=erd+diagram+tutorial", "type": "video"},
    ],
    "Normalization": [
        {"title": "StudyTonight: Normalization", "url": "https://www.studytonight.com/dbms/database-normalization.php", "type": "article"},
        {"title": "YouTube: Normalization", "url": "https://www.youtube.com/results?search_query=database+normalization", "type": "video"},
    ],
    "SQL": [
        {"title": "W3Schools SQL", "url": "https://www.w3schools.com/sql/", "type": "article"},
        {"title": "SQL Tutorial", "url": "https://www.sqltutorial.org/", "type": "article"},
        {"title": "YouTube: SQL Course", "url": "https://www.youtube.com/results?search_query=sql+tutorial", "type": "video"},
    ],
    "Indexes": [
        {"title": "MySQL Indexes", "url": "https://dev.mysql.com/doc/refman/8.0/en/optimization-indexes.html", "type": "article"},
        {"title": "YouTube: Indexes Explained", "url": "https://www.youtube.com/results?search_query=sql+indexes", "type": "video"},
    ],
    "Transactions": [
        {"title": "GeeksforGeeks: ACID", "url": "https://www.geeksforgeeks.org/acid-properties-in-dbms/", "type": "article"},
        {"title": "YouTube: Transactions", "url": "https://www.youtube.com/results?search_query=sql+transactions", "type": "video"},
    ],
    "HTML": [
        {"title": "MDN: HTML", "url": "https://developer.mozilla.org/en-US/docs/Web/HTML", "type": "article"},
        {"title": "W3Schools: HTML", "url": "https://www.w3schools.com/html/", "type": "article"},
        {"title": "YouTube: HTML Course", "url": "https://www.youtube.com/results?search_query=html+tutorial", "type": "video"},
    ],
    "CSS": [
        {"title": "MDN: CSS", "url": "https://developer.mozilla.org/en-US/docs/Web/CSS", "type": "article"},
        {"title": "W3Schools: CSS", "url": "https://www.w3schools.com/css/", "type": "article"},
        {"title": "YouTube: CSS Course", "url": "https://www.youtube.com/results?search_query=css+tutorial", "type": "video"},
    ],
    "JavaScript": [
        {"title": "MDN: JavaScript", "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript", "type": "article"},
        {"title": "W3Schools: JavaScript", "url": "https://www.w3schools.com/js/", "type": "article"},
        {"title": "YouTube: JavaScript Course", "url": "https://www.youtube.com/results?search_query=javascript+tutorial", "type": "video"},
    ],
    "React": [
        {"title": "React Official Docs", "url": "https://react.dev/", "type": "article"},
        {"title": "YouTube: React Course", "url": "https://www.youtube.com/results?search_query=react+tutorial", "type": "video"},
    ],
    "APIs": [
        {"title": "MDN: Web APIs", "url": "https://developer.mozilla.org/en-US/docs/Web/API", "type": "article"},
        {"title": "YouTube: REST API Tutorial", "url": "https://www.youtube.com/results?search_query=rest+api+tutorial", "type": "video"},
    ],
    "SDLC": [
        {"title": "SDLC Guide", "url": "https://www.tutorialspoint.com/sdlc/", "type": "article"},
        {"title": "YouTube: SDLC", "url": "https://www.youtube.com/results?search_query=software+development+life+cycle", "type": "video"},
    ],
    "Agile": [
        {"title": "Agile Manifesto", "url": "https://agilemanifesto.org/", "type": "article"},
        {"title": "YouTube: Agile", "url": "https://www.youtube.com/results?search_query=agile+methodology", "type": "video"},
    ],
    "Testing": [
        {"title": "Software Testing", "url": "https://www.guru99.com/software-testing-introduction-importance.html", "type": "article"},
        {"title": "YouTube: Testing", "url": "https://www.youtube.com/results?search_query=software+testing+tutorial", "type": "video"},
    ],
    "Design Patterns": [
        {"title": "Refactoring Guru: Design Patterns", "url": "https://refactoring.guru/design-patterns", "type": "article"},
        {"title": "YouTube: Design Patterns", "url": "https://www.youtube.com/results?search_query=design+patterns+tutorial", "type": "video"},
    ],
    "Version Control": [
        {"title": "Git Documentation", "url": "https://git-scm.com/doc", "type": "article"},
        {"title": "YouTube: Git Tutorial", "url": "https://www.youtube.com/results?search_query=git+tutorial", "type": "video"},
    ],
    "Arrays": [
        {"title": "Arrays in C++", "url": "https://www.geeksforgeeks.org/arrays-in-c-cpp/", "type": "article"},
        {"title": "YouTube: Arrays", "url": "https://www.youtube.com/results?search_query=arrays+data+structure", "type": "video"},
    ],
    "Linked Lists": [
        {"title": "Linked Lists", "url": "https://www.geeksforgeeks.org/data-structures/linked-list/", "type": "article"},
        {"title": "YouTube: Linked Lists", "url": "https://www.youtube.com/results?search_query=linked+list+data+structure", "type": "video"},
    ],
    "Stacks": [
        {"title": "Stack Data Structure", "url": "https://www.geeksforgeeks.org/stack-data-structure/", "type": "article"},
        {"title": "YouTube: Stacks", "url": "https://www.youtube.com/results?search_query=stack+data+structure", "type": "video"},
    ],
    "Queues": [
        {"title": "Queue Data Structure", "url": "https://www.geeksforgeeks.org/queue-data-structure/", "type": "article"},
        {"title": "YouTube: Queues", "url": "https://www.youtube.com/results?search_query=queue+data+structure", "type": "video"},
    ],
    "Trees": [
        {"title": "Tree Data Structure", "url": "https://www.geeksforgeeks.org/tree-data-structure/", "type": "article"},
        {"title": "YouTube: Trees", "url": "https://www.youtube.com/results?search_query=tree+data+structure", "type": "video"},
    ],
}

QUESTION_TEMPLATES = [
    "What is {}?",
    "Which statement best defines {}?",
    "Describe {}:",
    "How is {} used in programming?",
    "What is the purpose of {}?",
    "Which of the following correctly describes {}?",
    "In computing, what does {} refer to?",
    "What is the primary role of {}?",
    "How does {} function?",
    "Define {} in the context of software development.",
]


class Command(BaseCommand):
    help = "Massively seed database with realistic courses, topics, questions, and resources."

    def add_arguments(self, parser: CommandParser):
        parser.add_argument(
            "--reset",
            action="store_true",
            help="Delete all existing data before seeding",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        if options["reset"]:
            self.stdout.write("🗑️  Resetting existing data...")
            StudentAnswer.objects.all().delete()
            QuizAttempt.objects.all().delete()
            Question.objects.all().delete()
            LearningResource.objects.all().delete()
            KnowledgeArea.objects.all().delete()
            Course.objects.all().delete()
            User.objects.filter(role__in=["student", "lecturer"]).delete()
            self.stdout.write(self.style.SUCCESS("✅ Reset complete."))

        self.stdout.write(self.style.SUCCESS("🌱 Seeding massive dataset..."))

        # 1. Lecturer
        lecturer, _ = User.objects.get_or_create(
            username="lecturer1",
            defaults={
                "email": "lecturer@test.com",
                "role": "lecturer",
                "program": "Computer Science",
            }
        )
        lecturer.set_password("password123")
        lecturer.save()

        # 2. Students (20)
        students = []
        for i in range(20):
            student, _ = User.objects.get_or_create(
                username=f"student{i}",
                defaults={
                    "email": f"student{i}@test.com",
                    "role": "student",
                    "program": "Bachelor of Science in Information Technology",
                }
            )
            student.set_password("password123")
            student.save()
            students.append(student)

        # 3. Courses (5)
        course_data = [
            ("Programming Fundamentals", "PF101"),
            ("Database Systems", "DB201"),
            ("Web Development", "WD301"),
            ("Software Engineering", "SE401"),
            ("Data Structures", "DS501"),
        ]
        courses = []
        for name, code in course_data:
            course, _ = Course.objects.get_or_create(
                code=code,
                defaults={
                    "name": name,
                    "lecturer": lecturer,
                }
            )
            courses.append(course)

        # 4. Topics and Questions (25 per topic)
        topic_map = {
            "Programming Fundamentals": ["Variables", "Data Types", "Loops", "Functions", "OOP"],
            "Database Systems": ["ERD", "Normalization", "SQL", "Indexes", "Transactions"],
            "Web Development": ["HTML", "CSS", "JavaScript", "React", "APIs"],
            "Software Engineering": ["SDLC", "Agile", "Testing", "Design Patterns", "Version Control"],
            "Data Structures": ["Arrays", "Linked Lists", "Stacks", "Queues", "Trees"],
        }

        all_topics = []
        for course in courses:
            for topic_name in topic_map.get(course.name, []):
                topic, _ = KnowledgeArea.objects.get_or_create(
                    course=course,
                    name=topic_name,
                    defaults={"description": f"{topic_name} – core concepts"}
                )
                all_topics.append(topic)
                self.create_questions_for_topic(topic)

        # 5. Resources (from REAL_RESOURCES mapping)
        for topic in all_topics:
            topic_name = topic.name
            resources = REAL_RESOURCES.get(topic_name, [])
            if not resources:
                resources = [
                    {"title": f"{topic_name} – PDF Guide", "url": "https://example.com", "type": "pdf"},
                    {"title": f"{topic_name} – Video Lesson", "url": "https://youtube.com", "type": "video"},
                ]
            for res in resources:
                LearningResource.objects.get_or_create(
                    title=res["title"],
                    knowledge_area=topic,
                    defaults={
                        "resource_type": res["type"],
                        "url": res["url"],
                        "file": None,
                        "description": f"Learn about {topic_name} with this {res['type']} resource.",
                    }
                )

        # 6. Quiz Attempts (3–5 per student)
        for student in students:
            num_attempts = random.randint(3, 5)
            chosen_topics = random.sample(all_topics, min(num_attempts, len(all_topics)))
            for topic in chosen_topics:
                questions = list(Question.objects.filter(knowledge_area=topic))
                if len(questions) < 5:
                    continue
                sample_size = random.randint(5, min(15, len(questions)))
                selected_questions = random.sample(questions, sample_size)

                attempt = QuizAttempt.objects.create(
                    student=student,
                    score=0,
                )
                correct_count = 0
                for q in selected_questions:
                    if random.random() < 0.7:
                        chosen = q.correct_answer
                        is_correct = True
                        correct_count += 1
                    else:
                        wrong = [c for c in ["A", "B", "C", "D"] if c != q.correct_answer]
                        chosen = random.choice(wrong)
                        is_correct = False
                    StudentAnswer.objects.create(
                        attempt=attempt,
                        question=q,
                        answer=chosen,
                        is_correct=is_correct,
                    )
                total = len(selected_questions)
                attempt.score = (correct_count / total) * 100 if total > 0 else 0
                attempt.save()
                detect_gaps(student, attempt)

        self.stdout.write(self.style.SUCCESS("✅ Massive seeding complete!"))

    def create_questions_for_topic(self, topic):
        """Generate 25 realistic questions for a given topic."""
        topic_name = topic.name
        concept_data = CONCEPT_DB.get(topic_name)
        if concept_data is None:
            for i in range(25):
                q_text = fake.sentence(nb_words=8)
                options = [fake.sentence(nb_words=5) for _ in range(4)]
                correct_idx = random.randint(0, 3)
                correct_letter = ["A", "B", "C", "D"][correct_idx]
                Question.objects.get_or_create(
                    question_text=q_text,
                    knowledge_area=topic,
                    defaults={
                        "option_a": options[0],
                        "option_b": options[1],
                        "option_c": options[2],
                        "option_d": options[3],
                        "correct_answer": correct_letter,
                    }
                )
            return

        correct_def = concept_data["correct"]
        distractors = concept_data["distractors"]

        for i in range(10):
            template = random.choice(QUESTION_TEMPLATES)
            q_text = template.format(topic_name)
            option_list = [correct_def] + distractors
            random.shuffle(option_list)
            correct_index = option_list.index(correct_def)
            correct_letter = ["A", "B", "C", "D"][correct_index]
            Question.objects.get_or_create(
                question_text=q_text,
                knowledge_area=topic,
                defaults={
                    "option_a": option_list[0],
                    "option_b": option_list[1],
                    "option_c": option_list[2],
                    "option_d": option_list[3],
                    "correct_answer": correct_letter,
                }
            )

        for j in range(15):
            q_text = f"{random.choice(['Explain', 'Describe', 'What is', 'How does'])} {topic_name} in programming?"
            options = [
                correct_def,
                fake.sentence(nb_words=6),
                fake.sentence(nb_words=6),
                fake.sentence(nb_words=6)
            ]
            random.shuffle(options)
            correct_letter = ["A", "B", "C", "D"][options.index(correct_def)]
            Question.objects.get_or_create(
                question_text=q_text,
                knowledge_area=topic,
                defaults={
                    "option_a": options[0],
                    "option_b": options[1],
                    "option_c": options[2],
                    "option_d": options[3],
                    "correct_answer": correct_letter,
                }
            )