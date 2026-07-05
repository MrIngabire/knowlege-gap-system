import { useEffect, useState } from "react";
import api from "../api/axios";
import useAuth from "../hooks/useAuth";

import StatCard from "../components/StatCard";
import LoadingSpinner from "../components/LoadingSpinner";
import PageHeader from "../components/PageHeader";

export default function Dashboard() {

  const { user } = useAuth();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    if (user) {
      fetchDashboard();
    }

  }, [user]);

  const fetchDashboard = async () => {

    try {

      const response = await api.get(
        `/dashboard/${user.id}/`
      );

      setStats(response.data);

    } catch (error) {

      console.error(error);

    } finally {

      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (

    <div>

      <PageHeader
        title="Dashboard"
        subtitle="Overview of your learning progress"
      />

      <div className="grid md:grid-cols-3 gap-6">

        <StatCard
          title="Attempts"
          value={stats?.attempts ?? 0}
        />

        <StatCard
          title="Knowledge Gaps"
          value={stats?.gaps ?? 0}
        />

        <StatCard
          title="Average Score"
          value={`${stats?.average_score ?? 0}%`}
        />

      </div>

    </div>
  );
}