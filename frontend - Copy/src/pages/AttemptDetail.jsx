import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import api from "../api/axios";
import LoadingSpinner from "../components/LoadingSpinner";
import PageHeader from "../components/PageHeader";

export default function AttemptDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttempt();
  }, [id]);

  const fetchAttempt = async () => {
    try {
      const res = await api.get(`/quiz_attempts/${id}/`);
      setAttempt(res.data);
    } catch (error) {
      console.error("Error fetching attempt:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!attempt) return <p className="text-red-500 text-center">Attempt not found.</p>;

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg hover:bg-gray-100 transition"
        >
          <FaArrowLeft className="text-gray-600" />
        </button>
        <PageHeader
          title="Attempt Review"
          subtitle={`Score: ${attempt.score}% · ${attempt.student_name} · ${new Date(attempt.created_at).toLocaleDateString()}`}
        />
      </div>

      <div className="space-y-4">
        {attempt.answers.map((ans, idx) => (
          <div
            key={idx}
            className={`bg-white rounded-xl shadow p-6 border-l-4 ${
              ans.is_correct ? "border-green-500" : "border-red-500"
            }`}
          >
            <div className="flex justify-between items-start">
              <h3 className="font-semibold text-lg">Q{idx + 1}: {ans.question_text}</h3>
              <span className="flex items-center gap-1">
                {ans.is_correct ? (
                  <FaCheckCircle className="text-green-500" />
                ) : (
                  <FaTimesCircle className="text-red-500" />
                )}
                <span className={ans.is_correct ? "text-green-600" : "text-red-600"}>
                  {ans.is_correct ? "Correct" : "Incorrect"}
                </span>
              </span>
            </div>

            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
              {["A", "B", "C", "D"].map((letter) => (
                <div
                  key={letter}
                  className={`p-2 rounded border ${
                    ans.answer === letter
                      ? ans.is_correct
                        ? "bg-green-100 border-green-500"
                        : "bg-red-100 border-red-500"
                      : ans.correct_answer === letter
                      ? "bg-green-50 border-green-300 border-dashed"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <span className="font-medium">{letter}.</span> {ans.options[letter]}
                  {ans.answer === letter && (
                    <span className="ml-2 text-sm text-gray-500">(your answer)</span>
                  )}
                  {ans.correct_answer === letter && ans.answer !== letter && (
                    <span className="ml-2 text-sm text-green-600">(correct)</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}