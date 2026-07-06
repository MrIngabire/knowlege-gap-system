import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaChartLine, 
  FaClipboardCheck, 
  FaExclamationTriangle, 
  FaTrophy,
  FaUserGraduate,
  FaCalendarAlt,
  FaArrowRight
} from "react-icons/fa";
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from "recharts";
import api from "../api/axios";
import useAuth from "../hooks/useAuth";
import LoadingSpinner from "../components/LoadingSpinner";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // Fetch dashboard stats
      const statsRes = await api.get(`/dashboard/${user.id}/`);
      setStats(statsRes.data);

      // Fetch real attempt history (now includes attempt.id)
      const attemptsRes = await api.get(`/attempts/${user.id}/`);
      setAttempts(attemptsRes.data);
    } catch (error) {
      console.error("Error fetching dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const competencyScore = stats?.average_score || 0;
  const bestScore = attempts.length > 0 ? Math.max(...attempts.map(a => a.score)) : 0;
  const bestScoreDate = attempts.length > 0 ? attempts[0].date : "N/A";

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section with Student Info */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              Welcome back, {user?.username || "Student"}
            </h1>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-blue-100">
              <span className="flex items-center gap-1">
                <FaUserGraduate className="text-sm" />
                Student ID: {user?.id || "N/A"}
              </span>
              {user?.program && (
                <span className="flex items-center gap-1">
                  <FaCalendarAlt className="text-sm" />
                  {user.program}
                </span>
              )}
            </div>
          </div>
          <div className="mt-4 md:mt-0 flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-xl font-bold">
              {user?.username?.charAt(0).toUpperCase() || "S"}
            </div>
          </div>
        </div>
      </div>

      {/* Competency Score & Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Competency Score - Circular */}
        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center justify-center">
          <div className="relative w-32 h-32">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle
                className="text-gray-200"
                strokeWidth="8"
                stroke="currentColor"
                fill="transparent"
                r="56"
                cx="64"
                cy="64"
              />
              <circle
                className="text-blue-600 transition-all duration-1000"
                strokeWidth="8"
                strokeDasharray={2 * Math.PI * 56}
                strokeDashoffset={2 * Math.PI * 56 * (1 - competencyScore / 100)}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r="56"
                cx="64"
                cy="64"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold">{Math.round(competencyScore)}%</span>
              <span className="text-xs text-gray-500">Competency</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Based on last {Math.min(attempts.length, 3)} attempts</p>
        </div>

        {/* Best Score */}
        <div className="bg-white rounded-xl shadow p-6 flex items-center">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-4">
            <FaTrophy className="text-xl" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Best Score</p>
            <p className="text-2xl font-bold">{bestScore}%</p>
            <p className="text-xs text-gray-400">{bestScoreDate}</p>
          </div>
        </div>

        {/* Assessments Taken */}
        <div className="bg-white rounded-xl shadow p-6 flex items-center">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-4">
            <FaClipboardCheck className="text-xl" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Assessments Taken</p>
            <p className="text-2xl font-bold">{stats?.attempts || 0}</p>
            <p className="text-xs text-gray-400">This semester</p>
          </div>
        </div>

        {/* Gaps Identified */}
        <div className="bg-white rounded-xl shadow p-6 flex items-center">
          <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 mr-4">
            <FaExclamationTriangle className="text-xl" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Gaps Identified</p>
            <p className="text-2xl font-bold">{stats?.gaps || 0}</p>
            <p className="text-xs text-gray-400">Across all attempts</p>
          </div>
        </div>
      </div>

      {/* Score Trend Chart */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-lg font-semibold">Score Trend</h2>
            <p className="text-sm text-gray-500">Last {Math.min(attempts.length, 3)} attempts</p>
          </div>
          {attempts.length > 3 && (
            <button 
              onClick={() => navigate("/attempts")}
              className="text-blue-600 text-sm hover:text-blue-800 font-medium"
            >
              View All →
            </button>
          )}
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={attempts.slice(0, 3)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ fill: "#3b82f6", r: 6 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Start New Assessment & Past Attempts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Start New Assessment Card */}
        <div className="lg:col-span-1 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl shadow p-6 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-4">
            <FaChartLine className="text-2xl" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Ready to test your knowledge?</h3>
          <p className="text-sm text-gray-600 mb-4">
            The AI will generate up to 10 randomized questions from your curriculum and detect gaps in real time.
          </p>
          <button
            onClick={() => navigate("/quiz")}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
          >
            <span>Begin Diagnostic</span>
            <FaArrowRight />
          </button>
        </div>

        {/* Past Attempts Table */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Past Attempts</h3>
            {attempts.length > 3 && (
              <button 
                onClick={() => navigate("/attempts")}
                className="text-blue-600 text-sm hover:text-blue-800 font-medium"
              >
                View All →
              </button>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 text-sm font-medium text-gray-500">Date</th>
                  <th className="text-left py-2 text-sm font-medium text-gray-500">Score</th>
                  <th className="text-left py-2 text-sm font-medium text-gray-500">Result</th>
                  <th className="text-left py-2 text-sm font-medium text-gray-500">Gaps Detected</th>
                </tr>
              </thead>
              <tbody>
                {attempts.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-4 text-gray-500">
                      No attempts yet. Start your first assessment!
                    </td>
                  </tr>
                ) : (
                  attempts.slice(0, 3).map((attempt, idx) => (
                    <tr 
                      key={idx} 
                      className="border-b last:border-b-0 hover:bg-gray-50 cursor-pointer"
                      onClick={() => navigate(`/attempts/${attempt.id}`)}
                    >
                      <td className="py-3 text-sm">{attempt.date}</td>
                      <td className="py-3 text-sm font-semibold">{attempt.score}%</td>
                      <td className="py-3 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          attempt.result === "Proficient"
                            ? "bg-green-100 text-green-700"
                            : attempt.result === "Developing"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}>
                          {attempt.result}
                        </span>
                      </td>
                      <td className="py-3 text-sm">
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
    </div>
  );
}