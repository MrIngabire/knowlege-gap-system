import { useEffect, useState } from "react";
import api from "../../api/axios";
import PageHeader from "../../components/PageHeader";
import DataTable from "../../components/DataTable";
import Modal from "../../components/Modal";
import toast from "react-hot-toast";

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({ name: "", code: "" });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await api.get("/courses/");
      setCourses(res.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (course = null) => {
    if (course) {
      setEditingCourse(course);
      setFormData({ name: course.name, code: course.code });
    } else {
      setEditingCourse(null);
      setFormData({ name: "", code: "" });
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingCourse(null);
    setFormData({ name: "", code: "" });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCourse) {
        await api.put(`/courses/${editingCourse.id}/`, formData);
        toast.success("Course updated");
      } else {
        await api.post("/courses/", formData);
        toast.success("Course created");
      }
      fetchCourses();
      handleCloseModal();
    } catch (error) {
      console.error(error);
      toast.error("Operation failed");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure?")) return;
    try {
      await api.delete(`/courses/${id}/`);
      toast.success("Course deleted");
      fetchCourses();
    } catch (error) {
      console.error(error);
      toast.error("Delete failed");
    }
  };

  const columns = [
    { header: "Name", accessor: "name" },
    { header: "Code", accessor: "code" },
  ];

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div>
      <PageHeader title="Manage Courses" subtitle="Create, edit, or delete courses" />
      <div className="mb-4">
        <button onClick={() => handleOpenModal()} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
          + New Course
        </button>
      </div>
      <DataTable columns={columns} data={courses} onEdit={handleOpenModal} onDelete={handleDelete} />

      <Modal isOpen={modalOpen} onClose={handleCloseModal} title={editingCourse ? "Edit Course" : "New Course"}>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Code</label>
            <input
              name="code"
              value={formData.code}
              onChange={handleChange}
              className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
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