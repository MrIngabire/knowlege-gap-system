import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts";
import {
  FaUsers,
  FaBook,
  FaQuestionCircle,
  FaFileAlt,
  FaExclamationTriangle,
  FaCheckCircle,
} from "react-icons/fa";
import api from "../api/axios";
import LoadingSpinner from "../components/LoadingSpinner";
import PageHeader from "../components/PageHeader";
import toast from "react-hot-toast";

const COLORS = {
  high: "#EF4444",
  medium: "#F59E0B",
  low: "#10B981",
};

export default function LecturerDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get("/lecturer/dashboard/");
      setData(response.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!data) return <p className="text-center text-gray-500">No data available.</p>;

  // Prepare chart data
  const chartData = data.topics.slice(0, 10).map((topic) => ({
    name: topic.name.length > 15 ? topic.name.substring(0, 15) + "..." : topic.name,
    failureRate: topic.failure_rate,
    students: topic.students_with_gaps,
    total: topic.total_students,
    course: topic.course,
    status: topic.status,
  }));

  const pieData = [
    { name: "Active Gaps", value: data.active_gaps || 0 },
    { name: "Resolved Gaps", value: data.resolved_gaps || 0 },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lecturer Dashboard"
        subtitle="Overview of platform activity and cohort performance"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow p-6 flex items-center">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-4">
            <FaUsers className="text-xl" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Students</p>
            <p className="text-2xl font-bold">{data.students}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6 flex items-center">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-4">
            <FaBook className="text-xl" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Courses</p>
            <p className="text-2xl font-bold">{data.courses}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6 flex items-center">
          <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mr-4">
            <FaQuestionCircle className="text-xl" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Questions</p>
            <p className="text-2xl font-bold">{data.questions}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6 flex items-center">
          <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 mr-4">
            <FaFileAlt className="text-xl" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Resources</p>
            <p className="text-2xl font-bold">{data.resources}</p>
          </div>
        </div>
      </div>

      {/* Gap Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow p-6 flex items-center">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 mr-4">
            <FaExclamationTriangle className="text-xl" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Active Knowledge Gaps</p>
            <p className="text-2xl font-bold">{data.active_gaps || 0}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6 flex items-center">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-4">
            <FaCheckCircle className="text-xl" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Resolved Knowledge Gaps</p>
            <p className="text-2xl font-bold">{data.resolved_gaps || 0}</p>
          </div>
        </div>
      </div>

      {/* Topic Failure Rate Chart */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-semibold mb-4">
          Cohort-Wide Topic Failure Rates
          <span className="text-sm font-normal text-gray-500 ml-2">
            (Top 10 topics with highest failure rates)
          </span>
        </h3>
        {chartData.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No topic data available yet. Students need to take quizzes to generate analytics.
          </p>
        ) : (
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical">
                <XAxis type="number" domain={[0, 100]} unit="%" />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={120}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  formatter={(value, name) => {
                    if (name === "failureRate") return [`${value}%`, "Failure Rate"];
                    return [value, name];
                  }}
                  labelFormatter={(label) => `Topic: ${label}`}
                />
                <Bar dataKey="failureRate" radius={[0, 4, 4, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.failureRate > 30
                          ? COLORS.high
                          : entry.failureRate > 15
                          ? COLORS.medium
                          : COLORS.low
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="bg-white rounded-xl shadow p-4">
        <div className="flex flex-wrap items-center gap-6">
          <span className="text-sm font-medium text-gray-700">Failure Rate Legend:</span>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-500"></div>
            <span className="text-sm text-gray-600">High (&gt;30%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-yellow-500"></div>
            <span className="text-sm text-gray-600">Medium (15-30%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500"></div>
            <span className="text-sm text-gray-600">Low (&lt;15%)</span>
          </div>
        </div>
      </div>

      {/* Gap Status Pie Chart */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Gap Status Overview</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                <Cell fill="#EF4444" />
                <Cell fill="#10B981" />
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Topic Details Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold">Topic Failure Details</h3>
          <p className="text-sm text-gray-500">
            Showing all topics with student performance data
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Topic
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Students With Gaps
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Students
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Failure Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.topics.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    No topic data available.
                  </td>
                </tr>
              ) : (
                data.topics.map((topic, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium">{topic.name}</td>
                    <td className="px-6 py-4 text-sm">{topic.course}</td>
                    <td className="px-6 py-4 text-sm">{topic.students_with_gaps}</td>
                    <td className="px-6 py-4 text-sm">{topic.total_students}</td>
                    <td className="px-6 py-4 text-sm font-semibold">{topic.failure_rate}%</td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          topic.status === "high"
                            ? "bg-red-100 text-red-700"
                            : topic.status === "medium"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {topic.status === "high"
                          ? "⚠️ High Concern"
                          : topic.status === "medium"
                          ? "📊 Moderate"
                          : "✅ Low Risk"}
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