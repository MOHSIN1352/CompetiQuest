"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import AdminSidebar from "../../components/adminSidebar";

export default function AdminPage() {
  const apiBase =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // Form states
  const [catName, setCatName] = useState("");
  const [catDesc, setCatDesc] = useState("");
  const [topicName, setTopicName] = useState("");
  const [topicDesc, setTopicDesc] = useState("");
  const [topicCategoryId, setTopicCategoryId] = useState("");
  const [questionData, setQuestionData] = useState({
    questionText: "",
    options: ["", "", "", ""],
    correctOptionIndex: 0,
    difficulty: "medium",
    topic: "",
    explanation: "",
  });

  const [showCategoryForm, setShowCategoryForm] = useState(true);
  const [showTopicForm, setShowTopicForm] = useState(true);
  const [showQuestionForm, setShowQuestionForm] = useState(true);

  const [categories, setCategories] = useState([]);
  const [topics, setTopics] = useState([]);
  const [busy, setBusy] = useState(false);
  const [loadingTable, setLoadingTable] = useState(true);

  useEffect(() => {
    fetchUsers();
    fetchAllData();
  }, []);

  async function fetchUsers() {
    setLoadingUsers(true);
    try {
      const res = await axios.get(`${apiBase}/users/all`, {
        withCredentials: true,
      });

      const list = Array.isArray(res.data) ? res.data : res.data.users || [];
      setUsers(list);
      setTotalUsers(list.length);
    } catch (err) {
      console.error("Failed to load users", err);
      toast.error("Failed to load users");
      setUsers([]);
      setTotalUsers(0);
    } finally {
      setLoadingUsers(false);
    }
  }

  async function fetchAllData() {
    setLoadingTable(true);
    try {
      const res = await axios.get(`${apiBase}/admin/overview`, {
        withCredentials: true,
      });
      const data = res.data;
      console.log(data);
      setUsers(data.users || []);
      setCategories(data.categories || []);
      setTopics(
        data.categories.flatMap((c) =>
          (c.topics || []).map((t) => ({
            ...t,
            categoryName: c.name,
            categoryId: c._id,
          }))
        )
      );

      toast.success("Loaded admin data");
    } catch (err) {
      console.error("Failed to load admin overview", err);
      toast.error("Failed to load admin data");
    } finally {
      setLoadingTable(false);
    }
  }

  async function handleCreateCategory(e) {
    e.preventDefault();
    if (!catName.trim()) return;
    setBusy(true);
    try {
      await axios.post(
        `${apiBase}/categories`,
        { name: catName, description: catDesc },
        { withCredentials: true }
      );
      setCatName("");
      setCatDesc("");
      toast.success("Category created");
      await fetchAllData();
    } catch (err) {
      console.error("Create category failed", err);
      toast.error(err?.response?.data?.message || "Failed to create category");
    } finally {
      setBusy(false);
    }
  }

  async function handleCreateTopic(e) {
    e.preventDefault();
    if (!topicName.trim() || !topicCategoryId) {
      toast.error("Please provide name and category for topic");
      return;
    }
    console.log("this is create: ", topicName, topicDesc, topicCategoryId);
    setBusy(true);
    try {
      await axios.post(
        `${apiBase}/topics`,
        {
          name: topicName,
          description: topicDesc,
          category: topicCategoryId,
        },
        { withCredentials: true }
      );
      setTopicName("");
      setTopicDesc("");
      setTopicCategoryId("");
      toast.success("Topic created");
      await fetchAllData();
    } catch (err) {
      console.error("Create topic failed", err);
      toast.error(err?.response?.data?.message || "Failed to create topic");
    } finally {
      setBusy(false);
    }
  }

  async function handleCreateQuestion(e) {
    e.preventDefault();
    const {
      questionText,
      options,
      correctOptionIndex,
      difficulty,
      topic,
      explanation,
    } = questionData;

    if (!questionText.trim() || !topic || options.some((opt) => !opt.trim())) {
      toast.error("Please fill all required fields (question, options, topic)");
      return;
    }

    setBusy(true);
    try {
      await axios.post(
        `${apiBase}/questions`,
        {
          questionText,
          options,
          correctOptionIndex,
          difficulty,
          topic,
          explanation,
        },
        { withCredentials: true }
      );

      toast.success("Question created");

      // Reset form
      setQuestionData({
        questionText: "",
        options: ["", "", "", ""],
        correctOptionIndex: 0,
        difficulty: "medium",
        topic: "",
        explanation: "",
      });

      await fetchAllData();
    } catch (err) {
      console.error("Create question failed", err);
      toast.error(err?.response?.data?.message || "Failed to create question");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground pt-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 p-4">
        <aside className="md:col-span-1">
          <AdminSidebar
            users={users}
            totalUsers={totalUsers}
            loading={loadingUsers}
          />
        </aside>

        <main className="md:col-span-3 space-y-6">
          <section className="bg-white/60 dark:bg-zinc-800 p-6 rounded shadow overflow-auto">
            <h2 className="text-xl font-semibold mb-3">
              Categories / Topics / Question counts
            </h2>

            {loadingTable ? (
              <p>Loading table...</p>
            ) : (
              <div className="w-full">
                <table className="min-w-full table-auto border-collapse">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="px-3 py-2">Category</th>
                      <th className="px-3 py-2">Topic</th>
                      <th className="px-3 py-2">Total Questions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!Array.isArray(topics) || topics.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="p-3">
                          No topics found
                        </td>
                      </tr>
                    ) : (
                      topics.map((t) => {
                        const tid = t._id;
                        const cat =
                          categories.find(
                            (c) =>
                              c._id === (t.category || (tid && t.categoryName))
                          ) || {};
                        const catName =
                          cat.name || t.categoryName || "Unassigned";
                        return (
                          <tr key={tid} className="border-b">
                            <td className="px-3 py-2 align-top">{catName}</td>
                            <td className="px-3 py-2 align-top">
                              {t.name || t.title || "Unnamed topic"}
                            </td>
                            <td className="px-3 py-2 align-top">
                              {t.questionCount}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* --- Create Category --- */}
          <section className="bg-white/60 dark:bg-zinc-800 p-6 rounded shadow">
            <div
              className="flex justify-between  cursor-pointer select-none "
              onClick={() => setShowCategoryForm((prev) => !prev)}
            >
              <h2 className="text-xl font-semibold mb-3">Create Category</h2>
              <span className="text-xl">{showCategoryForm ? "−" : "+"}</span>
            </div>

            {showCategoryForm && (
              <form onSubmit={handleCreateCategory} className="space-y-3 mt-2">
                <input
                  className="w-full p-2 border rounded"
                  placeholder="Category name"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                />
                <textarea
                  className="w-full p-2 border rounded"
                  placeholder="Description"
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                />
                <button
                  disabled={busy}
                  className="px-4 py-2 bg-accent text-white rounded"
                >
                  Create Category
                </button>
              </form>
            )}
          </section>

          <section className="bg-white/60 dark:bg-zinc-800 p-6 rounded shadow">
            <div
              className="flex justify-between cursor-pointer select-none"
              onClick={() => setShowTopicForm((prev) => !prev)}
            >
              <h2 className="text-xl font-semibold mb-3">Create Topic</h2>
              <span className="text-xl color-accent select-none">
                {showTopicForm ? "−" : "+"}
              </span>
            </div>

            {showTopicForm && (
              <form onSubmit={handleCreateTopic} className="space-y-3 mt-2">
                <input
                  className="w-full p-2 border rounded"
                  placeholder="Topic name"
                  value={topicName}
                  onChange={(e) => setTopicName(e.target.value)}
                />
                <textarea
                  className="w-full p-2 border rounded"
                  placeholder="Description"
                  value={topicDesc}
                  onChange={(e) => setTopicDesc(e.target.value)}
                />
                <select
                  className="w-full p-2 border rounded"
                  value={topicCategoryId}
                  onChange={(e) => setTopicCategoryId(e.target.value)}
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c._id || c.id} value={c._id || c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <button
                  disabled={busy}
                  className="px-4 py-2 bg-accent text-white rounded"
                >
                  Create Topic
                </button>
              </form>
            )}
          </section>

          <section className="bg-white/60 dark:bg-zinc-800 p-6 rounded shadow select-none">
            <div
              className="flex justify-between cursor-pointer"
              onClick={() => setShowQuestionForm((prev) => !prev)}
            >
              <h2 className="text-xl font-semibold mb-3">Create Question</h2>
              <span className="text-xl">{showQuestionForm ? "−" : "+"}</span>
            </div>

            {showQuestionForm && (
              <form onSubmit={handleCreateQuestion} className="space-y-3 mt-2">
                {/* Question Text */}
                <input
                  className="w-full p-2 border rounded"
                  placeholder="Enter question text"
                  value={questionData.questionText}
                  onChange={(e) =>
                    setQuestionData({
                      ...questionData,
                      questionText: e.target.value,
                    })
                  }
                />

                {/* Topic Dropdown */}
                <select
                  className="w-full p-2 border rounded"
                  value={questionData.topic || ""}
                  onChange={(e) =>
                    setQuestionData({ ...questionData, topic: e.target.value })
                  }
                >
                  <option value="">Select Topic</option>
                  {topics.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.name} ({t.categoryName})
                    </option>
                  ))}
                </select>

                {/* Options */}
                {questionData.options.map((opt, i) => (
                  <input
                    key={i}
                    className="w-full p-2 border rounded"
                    placeholder={`Option ${i + 1}`}
                    value={opt}
                    onChange={(e) => {
                      const newOpts = [...questionData.options];
                      newOpts[i] = e.target.value;
                      setQuestionData({ ...questionData, options: newOpts });
                    }}
                  />
                ))}

                {/* Correct Option Index */}
                <label className="block">
                  Correct Option Index (0–{questionData.options.length - 1})
                  <input
                    type="number"
                    min="0"
                    max={questionData.options.length - 1}
                    className="ml-2 w-20 p-1 border rounded"
                    value={questionData.correctOptionIndex}
                    onChange={(e) =>
                      setQuestionData({
                        ...questionData,
                        correctOptionIndex: Number(e.target.value),
                      })
                    }
                  />
                </label>

                {/* Difficulty Dropdown */}
                <select
                  className="w-full p-2 border rounded"
                  value={questionData.difficulty}
                  onChange={(e) =>
                    setQuestionData({
                      ...questionData,
                      difficulty: e.target.value,
                    })
                  }
                >
                  <option value="">Select Difficulty</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>

                {/* Explanation */}
                <textarea
                  className="w-full p-2 border rounded"
                  placeholder="Explanation"
                  value={questionData.explanation}
                  onChange={(e) =>
                    setQuestionData({
                      ...questionData,
                      explanation: e.target.value,
                    })
                  }
                />

                {/* Submit Button */}
                <button
                  disabled={busy}
                  className="px-4 py-2 bg-accent text-white rounded"
                >
                  Create Question
                </button>
              </form>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
