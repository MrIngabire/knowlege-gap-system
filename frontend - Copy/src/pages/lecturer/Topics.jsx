import { useEffect, useState } from "react";
import api from "../../api/axios";
import PageHeader from "../../components/PageHeader";
import DataTable from "../../components/DataTable";
import Modal from "../../components/Modal";
import toast from "react-hot-toast";

export default function Topics() {
  const [topics, setTopics] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);
  
  const [formData, setFormData] = useState({ 
    name: "", 
    description: "", 
    course: "" 
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch both topics and courses simultaneously
      const [tRes, cRes] = await Promise.all([
        api.get("/topics/"),
        api.get("/courses/")
      ]);
      setTopics(tRes.data);
      setCourses(cRes.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (topic = null) => {
    if (topic) {
      setEditingTopic(topic);
      setFormData({ 
        name: topic.name, 
        description: topic.description || "", 
        course: topic.course 
      });
    } else {
      setEditingTopic(null);
      setFormData({ name: "", description: "", course: "" });
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingTopic(null);
    setFormData({ name: "", description: "", course: "" });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTopic) {
        await api.put(`/topics/${editingTopic.id}/`, formData);
        toast.success("Topic updated");
      } else {
        await api.post("/topics/", formData);
        toast.success("Topic created");
      }
      fetchData();
      handleCloseModal();
    } catch (error) {
      console.error(error);
      toast.error("Operation failed");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure?")) return;
    try {
      await api.delete(`/topics/${id}/`);
      toast.success("Topic deleted");
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error("Delete failed");
    }
  };

  // Columns for the DataTable
  const columns = [
    { header: "Topic Name", accessor: "name" },
    { header: "Course", accessor: "course_name" }, // This relies on the course_name field in your serializer
    { header: "Description", accessor: "description" },
  ];

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div>
      <PageHeader title="Manage Topics" subtitle="Create, edit, or delete knowledge areas (topics)" />
      <div className="mb-4">
        <button 
          onClick={() => handleOpenModal()} 
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          + New Topic
        </button>
      </div>
      
      <DataTable 
        columns={columns} 
        data={topics} 
        onEdit={handleOpenModal} 
        onDelete={handleDelete} 
      />

      <Modal 
        isOpen={modalOpen} 
        onClose={handleCloseModal} 
        title={editingTopic ? "Edit Topic" : "New Topic"}
      >
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Topic Name</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Course</label>
            <select
              name="course"
              value={formData.course}
              onChange={handleChange}
              className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select a course...</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} - {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
              placeholder="Briefly describe what this topic covers..."
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            <button 
              type="button" 
              onClick={handleCloseModal} 
              className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Save
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}