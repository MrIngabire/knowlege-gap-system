import { useEffect, useState } from "react";

import api from "../api/axios";

import StatCard from "../components/StatCard";
import LoadingSpinner from "../components/LoadingSpinner";
import PageHeader from "../components/PageHeader";

export default function LecturerDashboard() {

  const [stats, setStats] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

    fetchStats();

  }, []);

  const fetchStats =
    async () => {

      try {

        const response =
          await api.get(
            "/api/lecturer/dashboard/"
          );

        setStats(
          response.data
        );

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
        title="Lecturer Dashboard"
        subtitle="Overview of platform activity"
      />

      <div className="grid md:grid-cols-4 gap-6">

        <StatCard
          title="Students"
          value={stats.students}
        />

        <StatCard
          title="Courses"
          value={stats.courses}
        />

        <StatCard
          title="Questions"
          value={stats.questions}
        />

        <StatCard
          title="Resources"
          value={stats.resources}
        />

      </div>

    </div>
  );
}