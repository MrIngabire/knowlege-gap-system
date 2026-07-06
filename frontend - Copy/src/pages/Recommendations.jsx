import { useEffect, useState } from "react";
import api from "../api/axios";
import useAuth from "../hooks/useAuth";
import LoadingSpinner from "../components/LoadingSpinner";
import PageHeader from "../components/PageHeader";
import GapQuizModal from "../components/GapQuizModal";
import { FaVideo, FaFilePdf, FaBook, FaExternalLinkAlt, FaCheckCircle, FaClock } from "react-icons/fa";

export default function Recommendations() {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGap, setSelectedGap] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (user) fetchRecommendations();
  }, [user]);

  const fetchRecommendations = async () => {
    try {
      const response = await api.get(`/recommendations/${user.id}/`);
      setRecommendations(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "video": return <FaVideo className="text-red-500" />;
      case "pdf": return <FaFilePdf className="text-red-600" />;
      case "article": return <FaBook className="text-blue-500" />;
      default: return <FaBook />;
    }
  };

  const handleTakeQuiz = (gapId, topicName) => {
    setSelectedGap({ id: gapId, topic: topicName });
    setModalOpen(true);
  };

  const handleQuizSuccess = () => {
    fetchRecommendations(); // Refresh the list
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <PageHeader title="Recommendations" subtitle="Resources tailored to your knowledge gaps" />
      {recommendations.length === 0 ? (
        <p className="text-gray-500">No gaps detected yet. Take a quiz to get started!</p>
      ) : (
        recommendations.map((item) => (
          <div key={item.topic} className="bg-white rounded-xl shadow p-6 mb-4">
            <div className="flex justify-between items-start">
              <h2 className="text-xl font-bold mb-4">{item.topic}</h2>
              <span className="flex items-center gap-2 text-sm">
                {item.gap_status === 'resolved' ? (
                  <span className="text-green-600 flex items-center gap-1">
                    <FaCheckCircle /> Resolved
                  </span>
                ) : (
                  <span className="text-orange-500 flex items-center gap-1">
                    <FaClock /> Active
                  </span>
                )}
              </span>
            </div>
            <ul className="space-y-3">
              {item.resources.map((resource) => (
                <li key={resource.id} className="flex items-center justify-between border-b pb-2">
                  <div className="flex items-center gap-3">
                    {getIcon(resource.resource_type)}
                    <div>
                      <p className="font-medium">{resource.title}</p>
                      {resource.description && (
                        <p className="text-sm text-gray-500">{resource.description}</p>
                      )}
                    </div>
                  </div>
                  {resource.url && (
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <span>Open</span>
                      <FaExternalLinkAlt className="text-xs" />
                    </a>
                  )}
                </li>
              ))}
            </ul>
            {item.gap_status !== 'resolved' && (
              <button
                onClick={() => handleTakeQuiz(item.gap_id, item.topic)}
                className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
              >
                Take Gap Quiz (3 questions)
              </button>
            )}
            {item.gap_status === 'resolved' && (
              <div className="mt-4 text-green-600 text-sm flex items-center gap-2">
                <FaCheckCircle /> Gap resolved! Great job!
              </div>
            )}
          </div>
        ))
      )}

      <GapQuizModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        gapId={selectedGap?.id}
        topicName={selectedGap?.topic}
        onSuccess={handleQuizSuccess}
      />
    </div>
  );
}