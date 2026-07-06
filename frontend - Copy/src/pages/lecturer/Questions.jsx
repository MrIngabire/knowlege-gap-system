import { useEffect, useState } from "react";
import api from "../../api/axios";
import PageHeader from "../../components/PageHeader";
import DataTable from "../../components/DataTable";
import Modal from "../../components/Modal";
import toast from "react-hot-toast";

export default function Questions() {
  const [questions, setQuestions] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  // Single question modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [formData, setFormData] = useState({
    knowledge_area: "",
    question_text: "",
    option_a: "",
    option_b: "",
    option_c: "",
    option_d: "",
    correct_answer: "A",
  });

  // Batch add modal
  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [batchQuestions, setBatchQuestions] = useState([
    { knowledge_area: "", question_text: "", option_a: "", option_b: "", option_c: "", option_d: "", correct_answer: "A" },
  ]);

  // Import modal
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importPreview, setImportPreview] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [qRes, tRes] = await Promise.all([api.get("/questions/"), api.get("/topics/")]);
      setQuestions(qRes.data);
      setTopics(tRes.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  // ---- Single question handlers ----
  const handleOpenModal = (question = null) => {
    if (question) {
      setEditingQuestion(question);
      setFormData({
        knowledge_area: question.knowledge_area,
        question_text: question.question_text,
        option_a: question.option_a,
        option_b: question.option_b,
        option_c: question.option_c,
        option_d: question.option_d,
        correct_answer: question.correct_answer,
      });
    } else {
      setEditingQuestion(null);
      setFormData({
        knowledge_area: "",
        question_text: "",
        option_a: "",
        option_b: "",
        option_c: "",
        option_d: "",
        correct_answer: "A",
      });
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingQuestion(null);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingQuestion) {
        await api.put(`/questions/${editingQuestion.id}/`, formData);
        toast.success("Question updated");
      } else {
        await api.post("/questions/", formData);
        toast.success("Question created");
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
      await api.delete(`/questions/${id}/`);
      toast.success("Question deleted");
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error("Delete failed");
    }
  };

  // ---- Batch add handlers ----
  const handleBatchOpen = () => {
    setBatchQuestions([
      { knowledge_area: "", question_text: "", option_a: "", option_b: "", option_c: "", option_d: "", correct_answer: "A" },
    ]);
    setBatchModalOpen(true);
  };

  const handleBatchClose = () => setBatchModalOpen(false);

  const handleBatchRowChange = (index, field, value) => {
    const updated = [...batchQuestions];
    updated[index][field] = value;
    setBatchQuestions(updated);
  };

  const addBatchRow = () => {
    setBatchQuestions([
      ...batchQuestions,
      { knowledge_area: "", question_text: "", option_a: "", option_b: "", option_c: "", option_d: "", correct_answer: "A" },
    ]);
  };

  const removeBatchRow = (index) => {
    if (batchQuestions.length <= 1) return;
    setBatchQuestions(batchQuestions.filter((_, i) => i !== index));
  };

  const handleBatchSubmit = async () => {
    const invalid = batchQuestions.some((q) => !q.knowledge_area || !q.question_text);
    if (invalid) {
      toast.error("Please fill all fields for each question.");
      return;
    }
    try {
      await api.post("/questions/bulk_create/", { questions: batchQuestions });
      toast.success(`${batchQuestions.length} questions created successfully!`);
      setBatchModalOpen(false);
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error("Failed to create batch questions.");
    }
  };

  // ---- Import handlers ----
  const handleImportOpen = () => {
    setImportFile(null);
    setImportPreview([]);
    setImportModalOpen(true);
  };

  const handleImportClose = () => setImportModalOpen(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImportFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target.result;
        let data;
        if (file.name.endsWith(".json")) {
          data = JSON.parse(content);
          if (data.questions) data = data.questions;
          if (!Array.isArray(data)) throw new Error("JSON must be an array");
          setImportPreview(data.slice(0, 5));
        } else if (file.name.endsWith(".csv")) {
          const lines = content.split("\n");
          const headers = lines[0].split(",").map((h) => h.trim());
          const rows = lines
            .slice(1)
            .filter((line) => line.trim())
            .map((line) => {
              const vals = line.split(",").map((v) => v.trim());
              return headers.reduce((obj, h, i) => ({ ...obj, [h]: vals[i] || "" }), {});
            });
          setImportPreview(rows.slice(0, 5));
        } else {
          toast.error("Unsupported file type");
        }
      } catch (err) {
        toast.error("Error parsing file: " + err.message);
      }
    };
    reader.readAsText(file);
  };

  const handleImportSubmit = async () => {
    if (!importFile) {
      toast.error("Please select a file");
      return;
    }
    const formData = new FormData();
    formData.append("file", importFile);
    try {
      const response = await api.post("/questions/import_questions/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success(`Successfully imported ${response.data.created} questions`);
      setImportModalOpen(false);
      fetchData();
    } catch (error) {
      console.error(error);
      if (error.response?.data?.errors) {
        toast.error("Import failed: " + error.response.data.errors.join("; "));
      } else {
        toast.error("Import failed");
      }
    }
  };

  const columns = [
    { header: "Question", accessor: "question_text" },
    { header: "Topic", accessor: "knowledge_area" },
    { header: "Correct", accessor: "correct_answer" },
  ];

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div>
      <PageHeader title="Manage Questions" subtitle="Create, edit, or delete questions" />
      <div className="mb-4 flex flex-wrap gap-2">
        <button onClick={() => handleOpenModal()} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
          + New Question
        </button>
        <button onClick={handleBatchOpen} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">
          + Batch Add
        </button>
        <button onClick={handleImportOpen} className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition">
          Import CSV/JSON
        </button>
      </div>
      <DataTable columns={columns} data={questions} onEdit={handleOpenModal} onDelete={handleDelete} />

      {/* Single question modal */}
      <Modal isOpen={modalOpen} onClose={handleCloseModal} title={editingQuestion ? "Edit Question" : "New Question"}>
        <form onSubmit={handleSubmit}>
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
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Question Text</label>
            <textarea
              name="question_text"
              value={formData.question_text}
              onChange={handleChange}
              className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {["A", "B", "C", "D"].map((opt) => (
              <div key={opt} className="mb-4">
                <label className="block text-sm font-medium mb-1">Option {opt}</label>
                <input
                  name={`option_${opt.toLowerCase()}`}
                  value={formData[`option_${opt.toLowerCase()}`]}
                  onChange={handleChange}
                  className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            ))}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Correct Answer</label>
            <select
              name="correct_answer"
              value={formData.correct_answer}
              onChange={handleChange}
              className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
              <option value="D">D</option>
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

      {/* Batch add modal */}
      <Modal isOpen={batchModalOpen} onClose={handleBatchClose} title="Batch Add Questions">
        <div className="max-h-96 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-2 text-left">Topic</th>
                <th className="p-2 text-left">Question</th>
                <th className="p-2 text-left">A</th>
                <th className="p-2 text-left">B</th>
                <th className="p-2 text-left">C</th>
                <th className="p-2 text-left">D</th>
                <th className="p-2 text-left">Correct</th>
                <th className="p-2"></th>
              </tr>
            </thead>
            <tbody>
              {batchQuestions.map((q, idx) => (
                <tr key={idx} className="border-b">
                  <td className="p-2">
                    <select
                      value={q.knowledge_area}
                      onChange={(e) => handleBatchRowChange(idx, "knowledge_area", e.target.value)}
                      className="w-full border rounded p-1"
                      required
                    >
                      <option value="">Select</option>
                      {topics.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      value={q.question_text}
                      onChange={(e) => handleBatchRowChange(idx, "question_text", e.target.value)}
                      className="w-full border rounded p-1"
                      placeholder="Question text"
                    />
                  </td>
                  {["a", "b", "c", "d"].map((opt) => (
                    <td key={opt} className="p-2">
                      <input
                        type="text"
                        value={q[`option_${opt}`]}
                        onChange={(e) => handleBatchRowChange(idx, `option_${opt}`, e.target.value)}
                        className="w-full border rounded p-1"
                        placeholder={opt.toUpperCase()}
                      />
                    </td>
                  ))}
                  <td className="p-2">
                    <select
                      value={q.correct_answer}
                      onChange={(e) => handleBatchRowChange(idx, "correct_answer", e.target.value)}
                      className="w-full border rounded p-1"
                    >
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="D">D</option>
                    </select>
                  </td>
                  <td className="p-2">
                    <button onClick={() => removeBatchRow(idx)} className="text-red-600 hover:text-red-800">
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex justify-between">
          <button onClick={addBatchRow} className="text-blue-600 hover:underline">
            + Add Row
          </button>
          <div className="flex gap-2">
            <button onClick={handleBatchClose} className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition">
              Cancel
            </button>
            <button onClick={handleBatchSubmit} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
              Create All
            </button>
          </div>
        </div>
      </Modal>

      {/* Import modal */}
      <Modal isOpen={importModalOpen} onClose={handleImportClose} title="Import Questions from CSV/JSON">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Upload File</label>
            <input
              type="file"
              accept=".csv,.json"
              onChange={handleFileChange}
              className="w-full border rounded-lg p-2"
            />
            <p className="text-xs text-gray-500 mt-1">
              CSV must have headers: course_id, topic_name, question_text, option_a, option_b, option_c, option_d,
              correct_answer (A/B/C/D).
              <br />
              JSON must be an array of objects with the same fields.
            </p>
          </div>
          {importPreview.length > 0 && (
            <div>
              <h4 className="font-semibold">Preview (first 5 rows)</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border">
                  <thead className="bg-gray-50">
                    <tr>
                      {Object.keys(importPreview[0]).map((key) => (
                        <th key={key} className="p-2 border text-left">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {importPreview.map((row, i) => (
                      <tr key={i} className="border-b">
                        {Object.values(row).map((val, j) => (
                          <td key={j} className="p-2 border">
                            {val}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <button onClick={handleImportClose} className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition">
              Cancel
            </button>
            <button
              onClick={handleImportSubmit}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
              disabled={!importFile}
            >
              Import
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}