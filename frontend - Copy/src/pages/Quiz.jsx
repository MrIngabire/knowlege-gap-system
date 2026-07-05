import { useEffect, useState } from "react";

import api from "../api/axios";
import useAuth from "../hooks/useAuth";

import PageHeader from "../components/PageHeader";
import LoadingSpinner from "../components/LoadingSpinner";

export default function Quiz() {

  const { user } = useAuth();

  const [questions, setQuestions] =
    useState([]);

  const [answers, setAnswers] =
    useState({});

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

    fetchQuestions();

  }, []);

  const fetchQuestions =
    async () => {

      try {

        const response =
          await api.get(
            "/questions/"
          );

        setQuestions(
          response.data
        );

      } catch (error) {

        console.error(error);

      } finally {

        setLoading(false);
      }
    };

  const selectAnswer = (
    questionId,
    answer
  ) => {

    setAnswers({
      ...answers,
      [questionId]:
        answer,
    });
  };

  const submitQuiz =
    async () => {

      const payload = {

        student_id:
          user.id,

        answers:
          Object.keys(
            answers
          ).map(
            (id) => ({
              question_id:
                Number(id),

              answer:
                answers[id],
            })
          ),
      };

      try {

        const response =
          await api.post(
            "/submit-quiz/",
            payload
          );

        alert(
          `Quiz submitted successfully. Score: ${response.data.score}%`
        );

      } catch (error) {

        console.error(error);

        alert(
          "Failed to submit quiz."
        );
      }
    };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (

    <div>

      <PageHeader
        title="Quiz"
        subtitle="Answer all questions carefully"
      />

      {questions.map((question) => (

        <div
          key={question.id}
          className="bg-white rounded-xl shadow p-6 mb-4"
        >

          <h2 className="font-semibold mb-4">
            {question.question_text}
          </h2>

          {[
            {
              key: "A",
              value:
                question.option_a,
            },
            {
              key: "B",
              value:
                question.option_b,
            },
            {
              key: "C",
              value:
                question.option_c,
            },
            {
              key: "D",
              value:
                question.option_d,
            },
          ].map((option) => (

            <button
              key={option.key}
              onClick={() =>
                selectAnswer(
                  question.id,
                  option.key
                )
              }
              className={`block w-full text-left border rounded p-3 mb-2
              ${
                answers[
                  question.id
                ] === option.key
                  ? "bg-blue-100 border-blue-500"
                  : ""
              }`}
            >
              {option.key}.{" "}
              {option.value}
            </button>

          ))}

        </div>

      ))}

      <button
        onClick={submitQuiz}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg"
      >
        Submit Quiz
      </button>

    </div>
  );
}