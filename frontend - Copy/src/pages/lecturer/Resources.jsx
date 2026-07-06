import { useEffect, useState } from "react";
import api from "../../api/axios";
import PageHeader from "../../components/PageHeader";
import DataTable from "../../components/DataTable";
import Modal from "../../components/Modal";
import toast from "react-hot-toast";

export default function Resources() {
  const [resources, setResources] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    resource_type: "pdf",
    url: "",
    knowledge_area: "",
    description: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [rRes, tRes] = await Promise.all([api.get("/resources/"), api.get("/topics/")]);
      setResources(rRes.data);
      setTopics(tRes.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (resource = null) => {
    if (resource) {
      setEditingResource(resource);
      setFormData({
        title: resource.title,
        resource_type: resource.resource_type,
        url: resource.url || "",
        knowledge_area: resource.knowledge_area,
        description: resource.description || "",
      });
    } else {
      setEditingResource(null);
      setFormData({ title: "", resource_type: "pdf", url: "", knowledge_area: "", description: "" });
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingResource(null);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingResource) {
        await api.put(`/resources/${editingResource.id}/`, formData);
        toast.success("Resource updated");
      } else {
        await api.post("/resources/", formData);
        toast.success("Resource created");
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
      await api.delete(`/resources/${id}/`);
      toast.success("Resource deleted");
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error("Delete failed");
    }
  };

  const columns = [
    { header: "Title", accessor: "title" },
    { header: "Type", accessor: "resource_type" },
    { header: "Topic", accessor: "knowledge_area" },
  ];

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div>
      <PageHeader title="Manage Resources" subtitle="Create, edit, or delete learning resources" />
      <div className="mb-4">
        <button onClick={() => handleOpenModal()} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
          + New Resource
        </button>
      </div>
      <DataTable columns={columns} data={resources} onEdit={handleOpenModal} onDelete={handleDelete} />

      <Modal isOpen={modalOpen} onClose={handleCloseModal} title={editingResource ? "Edit Resource" : "New Resource"}>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Resource Type</label>
            <select
              name="resource_type"
              value={formData.resource_type}
              onChange={handleChange}
              className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="pdf">PDF</option>
              <option value="video">Video</option>
              <option value="article">Article</option>
              <option value="interactive">Interactive</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">URL</label>
            <input
              name="url"
              value={formData.url}
              onChange={handleChange}
              className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://example.com"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="2"
              placeholder="Brief description of this resource"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Topic</label>
            <select
              name="knowledge_area"
              value={formData.knowledge_area}
              onChange={handleChange}
              className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select topic</option>
              {topics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={handleCloseModal} className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              Save
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}