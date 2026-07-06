import { useState, useEffect } from "react";
import Modal from "./Modal";
import LoadingSpinner from "./LoadingSpinner";
import toast from "react-hot-toast";
import api from "../api/axios";

export default function GapQuizModal({ isOpen, onClose, gapId, topicName, onSuccess }) {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState(null);

  useEffect(() => {
    if (isOpen && gapId) {
      fetchQuiz();
    }
  }, [isOpen, gapId]);

  const fetchQuiz = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/gap-quiz/${gapId}/`);
      setQuestions(response.data.questions);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load quiz questions.");
    } finally {
      setLoading(false);
    }
  };

  const selectAnswer = (questionId, answer) => {
    setAnswers({ ...answers, [questionId]: answer });
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length !== questions.length) {
      toast.error("Please answer all questions.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        gap_id: gapId,
        answers: Object.keys(answers).map((id) => ({
          question_id: Number(id),
          answer: answers[id],
        })),
      };
      const response = await api.post("/clear-gap/", payload);
      setResults(response.data);

      if (response.data.passed) {
        toast.success(response.data.message);
        onSuccess?.(); // Refresh recommendations
        setTimeout(() => {
          onClose();
          setResults(null);
          setAnswers({});
        }, 3000);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit quiz.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setResults(null);
    setAnswers({});
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`Gap Clearance Quiz: ${topicName}`}>
      {loading ? (
        <LoadingSpinner />
      ) : results ? (
        <div className="space-y-4">
          <div className={`p-4 rounded-lg text-center ${results.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            <p className="text-xl font-bold">{results.score}%</p>
            <p>{results.message}</p>
          </div>
          <div className="space-y-2">
            {results.results.map((r, idx) => (
              <div key={idx} className="flex items-center gap-2 p-2 border rounded">
                <span>{r.correct ? '✅' : '❌'}</span>
                <span>Question {idx + 1}:</span>
                <span>Your answer: {r.your_answer}</span>
                {!r.correct && <span className="text-green-600">Correct: {r.correct_answer}</span>}
              </div>
            ))}
          </div>
          <button onClick={handleClose} className="w-full bg-blue-600 text-white py-2 rounded-lg">
            Close
          </button>
        </div>
      ) : (
        <div>
          <p className="text-gray-600 mb-4">
            Answer all 3 questions correctly to clear this gap. You need at least 60% to pass.
          </p>
          <div className="space-y-4">
            {questions.map((q, idx) => (
              <div key={q.id} className="border rounded-lg p-4">
                <p className="font-medium mb-2">Q{idx + 1}: {q.question_text}</p>
                <div className="space-y-2">
                  {['A', 'B', 'C', 'D'].map((letter) => (
                    <button
                      key={letter}
                      onClick={() => selectAnswer(q.id, letter)}
                      className={`block w-full text-left p-2 border rounded transition ${
                        answers[q.id] === letter
                          ? 'bg-blue-100 border-blue-500'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      {letter}. {q.options[letter]}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="mt-4 w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit Quiz'}
          </button>
        </div>
      )}
    </Modal>
  );
}