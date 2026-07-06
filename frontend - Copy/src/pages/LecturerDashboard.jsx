import { useEffect, useState } from "react";
import api from "../api/axios";
import StatCard from "../components/StatCard";
import LoadingSpinner from "../components/LoadingSpinner";
import PageHeader from "../components/PageHeader";
import toast from "react-hot-toast";

export default function LecturerDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get("/lecturer/dashboard/");
      setStats(response.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load dashboard data.");
      setStats({ students: 0, courses: 0, questions: 0, resources: 0 });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <PageHeader title="Lecturer Dashboard" subtitle="Overview of platform activity" />
      <div className="grid md:grid-cols-4 gap-6">
        <StatCard title="Students" value={stats?.students || 0} />
        <StatCard title="Courses" value={stats?.courses || 0} />
        <StatCard title="Questions" value={stats?.questions || 0} />
        <StatCard title="Resources" value={stats?.resources || 0} />
      </div>
    </div>
  );
}