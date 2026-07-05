import { useEffect, useState } from "react";

import api from "../api/axios";
import useAuth from "../hooks/useAuth";

import LoadingSpinner from "../components/LoadingSpinner";
import PageHeader from "../components/PageHeader";

export default function Recommendations() {

  const { user } = useAuth();

  const [recommendations,
    setRecommendations] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

    if (user) {
      fetchRecommendations();
    }

  }, [user]);

  const fetchRecommendations =
    async () => {

      try {

        const response =
          await api.get(
            `/recommendations/${user.id}/`
          );

        setRecommendations(
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
        title="Recommendations"
        subtitle="Resources tailored to your knowledge gaps"
      />

      {recommendations.map((item) => (

        <div
          key={item.topic}
          className="bg-white rounded-xl shadow p-6 mb-4"
        >

          <h2 className="text-xl font-bold mb-4">
            {item.topic}
          </h2>

          <ul>

            {item.resources.map(
              (resource) => (

                <li
                  key={resource.id}
                  className="py-2 border-b"
                >
                  {resource.title}
                </li>

              )
            )}

          </ul>

        </div>

      ))}

    </div>
  );
}