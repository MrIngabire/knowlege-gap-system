import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import api from "../api/axios";
import useAuth from "../hooks/useAuth";
import LoadingSpinner from "../components/LoadingSpinner";
import PageHeader from "../components/PageHeader";

export default function AttemptHistory() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchAttempts();
  }, [user]);

  const fetchAttempts = async () => {
    try {
      const res = await api.get(`/attempts/${user.id}/`);
      setAttempts(res.data);
    } catch (error) {
      console.error("Error fetching attempts:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-gray-100 transition">
          <FaArrowLeft className="text-gray-600" />
        </button>
        <PageHeader title="All Attempts" subtitle="Complete history of your assessments" />
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Result</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gaps Detected</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {attempts.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                    No attempts yet. Start your first assessment!
                  </td>
                </tr>
              ) : (
                attempts.map((attempt, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/attempts/${attempt.id}`)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{attempt.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">{attempt.score}%</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          attempt.result === "Proficient"
                            ? "bg-green-100 text-green-700"
                            : attempt.result === "Developing"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {attempt.result}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex flex-wrap gap-1">
                        {attempt.gaps.length === 0 ? (
                          <span className="text-gray-400 text-xs">No gaps</span>
                        ) : (
                          attempt.gaps.map((gap, i) => (
                            <span key={i} className="px-2 py-0.5 bg-red-50 text-red-600 text-xs rounded-full">
                              {gap}
                            </span>
                          ))
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}