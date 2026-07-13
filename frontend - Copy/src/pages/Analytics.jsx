import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import { FaChartLine, FaClipboardCheck, FaExclamationTriangle, FaTrophy } from "react-icons/fa";
import api from "../api/axios";
import useAuth from "../hooks/useAuth";
import LoadingSpinner from "../components/LoadingSpinner";
import PageHeader from "../components/PageHeader";
import toast from "react-hot-toast";

const COLORS = {
  good: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  info: "#3B82F6",
};

export default function Analytics() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user]);

  const fetchAnalytics = async () => {
    try {
      const response = await api.get("/analytics/");
      setData(response.data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      toast.error("Failed to load analytics data.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!data) return <p className="text-center text-gray-500">No analytics data available.</p>;

  const { topic_performance, trend_data, summary } = data;

  // Prepare chart data
  const chartData = topic_performance.map((item) => ({
    topic: item.topic.length > 15 ? item.topic.substring(0, 15) + "..." : item.topic,
    score: item.score,
    fullTopic: item.topic,
    correct: item.correct,
    total: item.total,
    isGap: item.gap,
  }));

  // Prepare gap status for pie chart
  const pieData = [
    { name: "Active Gaps", value: summary.active_gaps || 0 },
    { name: "Resolved Gaps", value: summary.resolved_gaps || 0 },
    { name: "No Gap (Passed)", value: Math.max(0, chartData.filter(d => !d.isGap).length - summary.resolved_gaps) },
  ];

  // Calculate average score across topics
  const avgTopicScore = chartData.length > 0 
    ? chartData.reduce((sum, d) => sum + d.score, 0) / chartData.length 
    : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        subtitle="Your performance analytics and knowledge gap insights"
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow p-6 flex items-center">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-4">
            <FaChartLine className="text-xl" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Average Score</p>
            <p className="text-2xl font-bold">{summary.average_score}%</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6 flex items-center">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-4">
            <FaTrophy className="text-xl" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Best Score</p>
            <p className="text-2xl font-bold">{summary.best_score}%</p>
            <p className="text-xs text-gray-400">{summary.best_score_date}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6 flex items-center">
          <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mr-4">
            <FaClipboardCheck className="text-xl" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Attempts</p>
            <p className="text-2xl font-bold">{summary.total_attempts}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6 flex items-center">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 mr-4">
            <FaExclamationTriangle className="text-xl" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Active Gaps</p>
            <p className="text-2xl font-bold">{summary.active_gaps}</p>
          </div>
        </div>
      </div>

      

      {/* Two-column layout for charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Topic Performance Bar Chart */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold mb-4">
            Topic Performance
            <span className="text-sm font-normal text-gray-500 ml-2">
              ({chartData.length} topics)
            </span>
          </h3>
          {chartData.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No topic data available. Take a quiz to generate analytics.
            </p>
          ) : (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical">
                  <XAxis type="number" domain={[0, 100]} unit="%" />
                  <YAxis
                    type="category"
                    dataKey="topic"
                    width={80}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip
                    formatter={(value) => [`${value}%`, "Score"]}
                    labelFormatter={(label) => `Topic: ${label}`}
                  />
                  <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.score >= 80
                            ? COLORS.good
                            : entry.score >= 60
                            ? COLORS.warning
                            : COLORS.danger
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
          <div className="flex flex-wrap items-center gap-4 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-500"></div>
              <span>Proficient (≥80%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-yellow-500"></div>
              <span>Developing (60-79%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-500"></div>
              <span>Gap (&lt;60%)</span>
            </div>
          </div>
        </div>

        {/* Gap Status Pie Chart */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Gap Status Overview</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  dataKey="value"
                >
                  <Cell fill="#EF4444" />
                  <Cell fill="#10B981" />
                  <Cell fill="#3B82F6" />
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detailed Topic Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold">Topic Performance Details</h3>
            <p className="text-sm text-gray-500">
              Detailed breakdown of your performance per topic
            </p>
          </div>
          <span className="text-sm text-gray-500">
            Average: <span className="font-bold">{avgTopicScore.toFixed(1)}%</span>
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Topic
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Correct / Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {chartData.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                    No data available. Take a quiz to generate analytics.
                  </td>
                </tr>
              ) : (
                chartData.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium">{item.fullTopic}</td>
                    <td className="px-6 py-4 text-sm">
                      {item.correct} / {item.total}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`font-semibold ${
                          item.score >= 80
                            ? "text-green-600"
                            : item.score >= 60
                            ? "text-yellow-600"
                            : "text-red-600"
                        }`}
                      >
                        {item.score}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.isGap
                            ? "bg-red-100 text-red-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {item.isGap ? "⚠️ Gap Detected" : "✅ Proficient"}
                      </span>
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