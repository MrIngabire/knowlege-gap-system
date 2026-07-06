import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import api from "../api/axios";
import useAuth from "../hooks/useAuth";
import PageHeader from "../components/PageHeader";
import LoadingSpinner from "../components/LoadingSpinner";

export default function Quiz() {
  const { user } = useAuth();

  const [courses, setCourses] = useState([]);
  const [topics, setTopics] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchTopics(selectedCourse);
    } else {
      setTopics([]);
      setSelectedTopic("");
      setQuestions([]);
      setAnswers({});
    }
  }, [selectedCourse]);

  useEffect(() => {
    if (selectedTopic) {
      fetchQuestions(selectedTopic);
    } else if (selectedCourse) {
      fetchQuestions(null, selectedCourse);
    } else {
      setQuestions([]);
      setAnswers({});
    }
  }, [selectedTopic, selectedCourse]);

  const fetchCourses = async () => {
    try {
      const res = await api.get("/courses/");
      setCourses(res.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  const fetchTopics = async (courseId) => {
    try {
      const res = await api.get(`/topics/?course=${courseId}`);
      setTopics(res.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load topics");
    }
  };

  const fetchQuestions = async (topicId = null, courseId = null) => {
    setLoading(true);
    try {
      let url = "/questions/";
      const params = new URLSearchParams();
      if (topicId) params.append("topic", topicId);
      if (courseId && !topicId) params.append("course", courseId);
      if (params.toString()) url += "?" + params.toString();
      const res = await api.get(url);
      const allQuestions = res.data;
      const shuffled = allQuestions.sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, 10);
      setQuestions(selected);
      setAnswers({});
    } catch (error) {
      console.error(error);
      toast.error("Failed to load questions");
    } finally {
      setLoading(false);
    }
  };

  const selectAnswer = (questionId, answer) => {
    setAnswers({ ...answers, [questionId]: answer });
  };

  const submitQuiz = async () => {
    if (Object.keys(answers).length !== questions.length) {
      toast.error("Please answer all questions before submitting.");
      return;
    }
    setSubmitting(true);
    const payload = {
      student_id: user.id,
      answers: Object.keys(answers).map((id) => ({
        question_id: Number(id),
        answer: answers[id],
      })),
    };
    try {
      const response = await api.post("/submit-quiz/", payload);
      toast.success(`Quiz submitted! Score: ${response.data.score}%`);
      setAnswers({});
      if (selectedTopic) {
        fetchQuestions(selectedTopic);
      } else if (selectedCourse) {
        fetchQuestions(null, selectedCourse);
      } else {
        fetchQuestions();
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit quiz.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && courses.length === 0) return <LoadingSpinner />;

  return (
    <div>
      <Toaster position="top-center" />
      <PageHeader title="Quiz" subtitle="Select a course and topic, then answer up to 10 random questions" />

      <div className="mb-6 flex gap-4 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium mb-1">Course</label>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select course</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium mb-1">Topic</label>
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={!selectedCourse}
          >
            <option value="">All topics</option>
            {topics.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : questions.length === 0 ? (
        <p className="text-gray-500">No questions available for this selection.</p>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">Showing {questions.length} random questions</p>
          {questions.map((question) => (
            <div key={question.id} className="bg-white rounded-xl shadow p-6 mb-4">
              <h2 className="font-semibold mb-4">{question.question_text}</h2>
              {["A", "B", "C", "D"].map((opt) => (
                <button
                  key={opt}
                  onClick={() => selectAnswer(question.id, opt)}
                  className={`block w-full text-left border rounded-lg p-3 mb-2 transition ${
                    answers[question.id] === opt ? "bg-blue-100 border-blue-500" : "hover:bg-gray-50"
                  }`}
                >
                  {opt}. {question[`option_${opt.toLowerCase()}`]}
                </button>
              ))}
            </div>
          ))}
          <button
            onClick={submitQuiz}
            disabled={submitting}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit Quiz"}
          </button>
        </>
      )}
    </div>
  );
}