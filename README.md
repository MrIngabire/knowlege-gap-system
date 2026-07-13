
---

# Knowledge Gap Detection & Learning Resource Recommendation System

An intelligent, web-based adaptive learning platform designed to programmatically detect student knowledge gaps and provide metadata-tagged, severity-calibrated learning resources.

## 🚀 Overview

This system identifies conceptual deficits by analyzing student assessment data against an institutional threshold (60%). It bridges the "remediation gap" by recommending targeted study materials and verifying recovery through a closed-loop "Gap Clearance Quiz."

## 🛠 Tech Stack

* **Backend:** Python | Django REST Framework
* **Frontend:** React (TypeScript) | Vite | TailwindCSS
* **Database:** PostgreSQL
* **Algorithmic Engine:** Item Response Theory (IRT) logic & Cosine Similarity

---

## 💻 Getting Started

Follow these steps to set up the project on **Windows** or **macOS**.

### 1. Prerequisites

Ensure you have the following installed:

* [Git](https://git-scm.com/)
* [Python 3.10+](https://www.python.org/)
* [Node.js (LTS version)](https://nodejs.org/)

### 2. Clone the Repository

Open your terminal (Command Prompt/PowerShell on Windows, Terminal on macOS) and run:

```bash
git clone https://github.com/MrIngabire/knowlege-gap-system.git
cd knowlege-gap-system

```

### 3. Backend Setup (Django)

```bash
# Create virtual environment
# Windows:
python -m venv venv
venv\Scripts\activate

# macOS/Linux:
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Start the server
python manage.py runserver

```

### 4. Frontend Setup (React)

Open a **new terminal** window in the same folder:

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev

```

---

## ⚙️ Environment Configuration

1. Create a `.env` file in the root directory (for Django) and inside the `frontend/` directory (for React).
2. Add your database credentials and secret keys (refer to `env.example` if available).
3. **Note:** Ensure your `.gitignore` file includes `.env` to keep your credentials secure!

---

## 📚 System Features

* **Diagnostic Engine:** Automatically flags topics where student performance falls below 60%.
* **Hybrid Recommendation Engine:** Maps gaps to specific resources using metadata tags.
* **Gap Clearance Loop:** Verifies mastery via a 3-question quiz before marking a gap as 'Resolved'.
* **Analytics Dashboard:** Visualizes cohort-wide failure trends for lecturers.

## 👥 Contributors

* **[Your Name/Author]** - Developer

## 📜 License

This project is developed for academic research purposes under the University of Kigali School of Computing and Information Technology.

---

*Created for UoK Academic Research Project*