"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Squares from "@/components/home/Squares";
import ProtectedRoute from "@/components/ProtectedRoute";
import { FaPlus, FaEdit, FaTrash, FaEye, FaUsers, FaBook, FaQuestionCircle, FaChevronDown, FaChevronUp } from "react-icons/fa";

function AdminPanel() {
  const [themeColors, setThemeColors] = useState({
    border: "oklch(0.15 0 0 / 0.1)",
    hover: "#222",
  });

  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(false);
  
  // Data states
  const [categories, setCategories] = useState([]);
  const [topics, setTopics] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [stats, setStats] = useState({});

  // Form states
  const [categoryForm, setCategoryForm] = useState({ name: "", description: "" });
  const [topicForm, setTopicForm] = useState({ name: "", description: "", category: "" });
  const [questionForm, setQuestionForm] = useState({
    questionText: "",
    options: ["", "", "", ""],
    correctOptionIndex: 0,
    topic: "",
    difficulty: "medium",
    explanation: ""
  });

  // Modal states
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch categories
      const categoriesRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/admin/test/categories`);
      setCategories(categoriesRes.data.categories || []);
      
      // Fetch topics
      const topicsRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/admin/test/topics`);
      setTopics(topicsRes.data.topics || []);
      
      // Fetch questions
      const questionsRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/admin/test/questions`);
      setQuestions(questionsRes.data.questions || []);
      
      // Fetch stats
      const statsRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/admin/test/dashboard-stats`);
      setStats(statsRes.data.stats || {});
      
    } catch (error) {
      console.error('Error:', error);
      toast.error("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/admin/test/categories`, categoryForm);
      toast.success("Category created successfully");
      setCategoryForm({ name: "", description: "" });
      setShowCategoryModal(false);
      fetchDashboardData();
    } catch (error) {
      toast.error("Failed to create category");
    }
  };

  const handleCreateTopic = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/admin/test/topics`, topicForm);
      toast.success("Topic created successfully");
      setTopicForm({ name: "", description: "", category: "" });
      setShowTopicModal(false);
      fetchDashboardData();
    } catch (error) {
      toast.error("Failed to create topic");
    }
  };

  const handleCreateQuestion = async (e) => {
    e.preventDefault();
    
    console.log('Submitting question form:', questionForm);
    console.log('Editing item:', editingItem);
    
    try {
      let response;
      if (editingItem) {
        const url = `${process.env.NEXT_PUBLIC_API_URL}/admin/test/questions/${editingItem._id}`;
        console.log('PUT URL:', url);
        response = await axios.put(url, questionForm);
        console.log('Update response:', response.data);
        toast.success("Question updated successfully");
      } else {
        const url = `${process.env.NEXT_PUBLIC_API_URL}/admin/test/questions`;
        console.log('POST URL:', url);
        response = await axios.post(url, questionForm);
        console.log('Create response:', response.data);
        toast.success("Question created successfully");
      }
      
      setQuestionForm({
        questionText: "",
        options: ["", "", "", ""],
        correctOptionIndex: 0,
        topic: "",
        difficulty: "medium",
        explanation: ""
      });
      setEditingItem(null);
      setShowQuestionModal(false);
      fetchDashboardData();
      
      if (selectedTopic) {
        fetchTopicQuestions(selectedTopic._id);
      }
    } catch (error) {
      console.error('Question submission error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url
      });
      toast.error(editingItem ? `Failed to update question: ${error.response?.data?.message || error.message}` : `Failed to create question: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleDelete = async (type, id) => {
    const message = type === 'category' 
      ? 'Are you sure? This will delete the category and all its topics and questions.'
      : `Are you sure you want to delete this ${type}?`;
      
    if (!confirm(message)) return;
    
    try {
      const pluralMap = {
        'category': 'categories',
        'topic': 'topics', 
        'question': 'questions'
      };
      
      const pluralType = pluralMap[type] || `${type}s`;
      const url = `${process.env.NEXT_PUBLIC_API_URL}/admin/test/${pluralType}/${id}`;
      
      const response = await axios.delete(url);
      toast.success(`${type} deleted successfully`);
      fetchDashboardData();
      
      if (selectedTopic && type === 'question') {
        fetchTopicQuestions(selectedTopic._id);
      }
    } catch (error) {
      toast.error(`Failed to delete ${type}: ${error.response?.data?.message || error.message}`);
    }
  };

  const DashboardTab = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-secondary/40 rounded-xl p-6 border border-border">
        <div className="flex items-center gap-4">
          <FaUsers className="text-3xl text-blue-500" />
          <div>
            <h3 className="text-2xl font-bold">{stats.usersCount || 0}</h3>
            <p className="text-muted-foreground">Total Users</p>
          </div>
        </div>
      </div>
      
      <div className="bg-secondary/40 rounded-xl p-6 border border-border">
        <div className="flex items-center gap-4">
          <FaBook className="text-3xl text-green-500" />
          <div>
            <h3 className="text-2xl font-bold">{stats.categoriesCount || 0}</h3>
            <p className="text-muted-foreground">Categories</p>
          </div>
        </div>
      </div>
      
      <div className="bg-secondary/40 rounded-xl p-6 border border-border">
        <div className="flex items-center gap-4">
          <FaBook className="text-3xl text-yellow-500" />
          <div>
            <h3 className="text-2xl font-bold">{stats.topicsCount || 0}</h3>
            <p className="text-muted-foreground">Topics</p>
          </div>
        </div>
      </div>
      
      <div className="bg-secondary/40 rounded-xl p-6 border border-border">
        <div className="flex items-center gap-4">
          <FaQuestionCircle className="text-3xl text-purple-500" />
          <div>
            <h3 className="text-2xl font-bold">{stats.questionsCount || 0}</h3>
            <p className="text-muted-foreground">Questions</p>
          </div>
        </div>
      </div>
    </div>
  );

  const CategoriesTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Categories</h2>
        <button
          onClick={() => setShowCategoryModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/80 transition-colors"
        >
          <FaPlus /> Add Category
        </button>
      </div>
      
      <div className="grid gap-4">
        {categories.map((category) => (
          <div key={category._id} className="bg-secondary/40 rounded-xl p-6 border border-border">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-semibold">{category.name}</h3>
                <p className="text-muted-foreground mt-2">{category.description}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleDelete("category", category._id)}
                  className="p-2 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const TopicsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Topics</h2>
        <button
          onClick={() => setShowTopicModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/80 transition-colors"
        >
          <FaPlus /> Add Topic
        </button>
      </div>
      
      <div className="grid gap-4">
        {topics.map((topic) => (
          <div key={topic._id} className="bg-secondary/40 rounded-xl p-6 border border-border">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-semibold">{topic.name}</h3>
                <p className="text-sm text-accent">{topic.category?.name}</p>
                <p className="text-muted-foreground mt-2">{topic.description}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleDelete("topic", topic._id)}
                  className="p-2 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const [selectedTopic, setSelectedTopic] = useState(null);
  const [topicQuestions, setTopicQuestions] = useState([]);
  const [loadingTopicQuestions, setLoadingTopicQuestions] = useState(false);

  const fetchTopicQuestions = async (topicId) => {
    setLoadingTopicQuestions(true);
    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL}/admin/test/questions/topic/${topicId}`;
      console.log('Fetching topic questions from:', url);
      const response = await axios.get(url);
      console.log('Topic questions response:', response.data);
      setTopicQuestions(response.data.questions || []);
    } catch (error) {
      console.error('Error fetching topic questions:', error);
      toast.error('Failed to load questions for this topic');
      setTopicQuestions([]);
    } finally {
      setLoadingTopicQuestions(false);
    }
  };

  const handleTopicClick = (topic) => {
    console.log('handleTopicClick called with:', topic);
    if (!topic || !topic._id) {
      console.error('Invalid topic data:', topic);
      toast.error('Invalid topic selected');
      return;
    }
    
    setSelectedTopic(topic);
    fetchTopicQuestions(topic._id);
  };

  const handleAddQuestionForTopic = (topic) => {
    setQuestionForm({...questionForm, topic: topic._id});
    setShowQuestionModal(true);
  };

  const QuestionsTab = () => {
    if (selectedTopic) {
      return (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <button
                onClick={() => setSelectedTopic(null)}
                className="text-accent hover:underline mb-2"
              >
                ← Back to Topics
              </button>
              <h2 className="text-2xl font-bold">{selectedTopic.name} Questions</h2>
              <p className="text-muted-foreground">Category: {selectedTopic.category?.name}</p>
            </div>
            <button
              onClick={() => handleAddQuestionForTopic(selectedTopic)}
              className="flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/80 transition-colors"
            >
              <FaPlus /> Add Question for {selectedTopic.name}
            </button>
          </div>
          
          <div className="grid gap-4">
            {loadingTopicQuestions ? (
              <div className="text-center py-8">
                <div className="text-lg text-muted-foreground">Loading questions...</div>
              </div>
            ) : topicQuestions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FaQuestionCircle className="mx-auto text-4xl mb-4" />
                <p>No questions found for this topic</p>
                <button
                  onClick={() => handleAddQuestionForTopic(selectedTopic)}
                  className="mt-4 px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/80 transition-colors"
                >
                  Add First Question
                </button>
              </div>
            ) : (
              topicQuestions.map((question) => (
                <div key={question._id} className="bg-secondary/40 rounded-xl p-6 border border-border">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2">{question.questionText}</h3>
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        {question.options.map((option, index) => (
                          <div
                            key={index}
                            className={`p-2 rounded text-sm ${
                              index === question.correctOptionIndex
                                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                : "bg-muted/40"
                            }`}
                          >
                            {option}
                          </div>
                        ))}
                      </div>
                      {question.explanation && (
                        <p className="text-sm text-muted-foreground italic">{question.explanation}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          console.log('Editing question:', question);
                          setEditingItem(question);
                          
                          // Extract topic ID properly
                          let topicId = '';
                          if (typeof question.topic === 'string') {
                            topicId = question.topic;
                          } else if (question.topic && question.topic._id) {
                            topicId = question.topic._id;
                          } else if (selectedTopic) {
                            topicId = selectedTopic._id;
                          }
                          
                          setQuestionForm({
                            questionText: question.questionText || '',
                            options: question.options || ['', '', '', ''],
                            correctOptionIndex: parseInt(question.correctOptionIndex) || 0,
                            topic: topicId,
                            difficulty: question.difficulty || 'medium',
                            explanation: question.explanation || ''
                          });
                          setShowQuestionModal(true);
                        }}
                        className="p-2 text-blue-500 hover:bg-blue-500/20 rounded-lg transition-colors"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete("question", question._id)}
                        className="p-2 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Questions by Topic</h2>
        </div>
        
        <div className="grid gap-4">
          {categories.map((category) => {
            const categoryTopics = topics.filter(topic => topic.category?._id === category._id);
            if (categoryTopics.length === 0) return null;
            
            return (
              <div key={category._id} className="bg-secondary/40 rounded-xl p-6 border border-border">
                <h3 className="text-xl font-semibold mb-4">{category.name}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {categoryTopics.map((topic) => {
                    const questionCount = questions.filter(q => {
                      const topicId = q.topic?._id || q.topic;
                      return topicId === topic._id;
                    }).length;
                    
                    return (
                      <div key={topic._id} className="group">
                        <button
                          onClick={() => {
                            console.log('Topic clicked:', topic);
                            handleTopicClick(topic);
                          }}
                          className="w-full p-4 bg-muted/40 rounded-lg border border-border hover:bg-accent/20 hover:border-accent hover:shadow-md transition-all duration-200 text-left cursor-pointer active:scale-95 focus:outline-none focus:ring-2 focus:ring-accent"
                          type="button"
                        >
                          <h4 className="font-semibold text-foreground">{topic.name}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {questionCount} question{questionCount !== 1 ? 's' : ''}
                          </p>
                          <div className="text-xs text-accent mt-1 opacity-70 group-hover:opacity-100 transition-opacity">Click to view questions</div>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center bg-background overflow-hidden p-4">
      <div className="absolute inset-0 z-0 opacity-50 dark:opacity-100">
        <Squares
          speed={0.3}
          squareSize={75}
          direction="diagonal"
          borderColor={themeColors.border || "#999"}
          hoverFillColor={themeColors.hover || "#222"}
        />
      </div>

      <div className="absolute inset-0 -z-10" style={{ perspective: "1000px" }}>
        <div
          className="absolute bottom-0 left-0 right-0 h-[150%] origin-bottom"
          style={{
            transform: "rotateX(55deg)",
            maskImage: "linear-gradient(to top, black 30%, transparent 80%)",
            WebkitMaskImage: "linear-gradient(to top, black 30%, transparent 80%)",
          }}
        >
          <Squares
            speed={0.4}
            squareSize={50}
            direction="diagonal"
            borderColor={themeColors.border}
            hoverFillColor={themeColors.hover}
          />
        </div>
      </div>

      <div className="relative w-full max-w-7xl bg-muted/40 rounded-2xl overflow-hidden shadow-md p-6 shadow-accent">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>
          
          <div className="flex gap-2 mb-6">
            {["dashboard", "categories", "topics", "questions"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg transition-colors capitalize ${
                  activeTab === tab
                    ? "bg-accent text-accent-foreground"
                    : "bg-secondary/40 hover:bg-secondary/60"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-lg text-muted-foreground">Loading...</div>
          </div>
        ) : (
          <>
            {activeTab === "dashboard" && <DashboardTab />}
            {activeTab === "categories" && <CategoriesTab />}
            {activeTab === "topics" && <TopicsTab />}
            {activeTab === "questions" && <QuestionsTab />}
          </>
        )}
      </div>

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add Category</h2>
            <form onSubmit={handleCreateCategory} className="space-y-4">
              <input
                type="text"
                placeholder="Category Name"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                className="w-full p-3 rounded-lg bg-secondary/40 border border-border"
                required
              />
              <textarea
                placeholder="Description"
                value={categoryForm.description}
                onChange={(e) => setCategoryForm({...categoryForm, description: e.target.value})}
                className="w-full p-3 rounded-lg bg-secondary/40 border border-border"
                rows="3"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/80 transition-colors"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="flex-1 py-2 bg-secondary/40 rounded-lg hover:bg-secondary/60 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Topic Modal */}
      {showTopicModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add Topic</h2>
            <form onSubmit={handleCreateTopic} className="space-y-4">
              <input
                type="text"
                placeholder="Topic Name"
                value={topicForm.name}
                onChange={(e) => setTopicForm({...topicForm, name: e.target.value})}
                className="w-full p-3 rounded-lg bg-secondary/40 border border-border"
                required
              />
              <select
                value={topicForm.category}
                onChange={(e) => setTopicForm({...topicForm, category: e.target.value})}
                className="w-full p-3 rounded-lg bg-secondary/40 border border-border"
                required
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
              <textarea
                placeholder="Description"
                value={topicForm.description}
                onChange={(e) => setTopicForm({...topicForm, description: e.target.value})}
                className="w-full p-3 rounded-lg bg-secondary/40 border border-border"
                rows="3"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/80 transition-colors"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowTopicModal(false)}
                  className="flex-1 py-2 bg-secondary/40 rounded-lg hover:bg-secondary/60 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Question Modal */}
      {showQuestionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-background rounded-xl p-6 w-full max-w-2xl m-4">
            <h2 className="text-xl font-bold mb-4">{editingItem ? 'Edit Question' : 'Add Question'}</h2>
            <form onSubmit={handleCreateQuestion} className="space-y-4">
              <textarea
                placeholder="Question Text"
                value={questionForm.questionText}
                onChange={(e) => setQuestionForm({...questionForm, questionText: e.target.value})}
                className="w-full p-3 rounded-lg bg-secondary/40 border border-border"
                rows="3"
                required
              />
              
              <select
                value={questionForm.topic}
                onChange={(e) => setQuestionForm({...questionForm, topic: e.target.value})}
                className="w-full p-3 rounded-lg bg-secondary/40 border border-border"
                required
              >
                <option value="">Select Topic</option>
                {topics.map((topic) => (
                  <option key={topic._id} value={topic._id}>
                    {topic.name} ({topic.category?.name})
                  </option>
                ))}
              </select>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {questionForm.options.map((option, index) => (
                  <input
                    key={index}
                    type="text"
                    placeholder={`Option ${index + 1}`}
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...questionForm.options];
                      newOptions[index] = e.target.value;
                      setQuestionForm({...questionForm, options: newOptions});
                    }}
                    className="w-full p-3 rounded-lg bg-secondary/40 border border-border"
                    required
                  />
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select
                  value={questionForm.correctOptionIndex}
                  onChange={(e) => setQuestionForm({...questionForm, correctOptionIndex: parseInt(e.target.value)})}
                  className="w-full p-3 rounded-lg bg-secondary/40 border border-border"
                >
                  <option value={0}>Option 1 (Correct)</option>
                  <option value={1}>Option 2 (Correct)</option>
                  <option value={2}>Option 3 (Correct)</option>
                  <option value={3}>Option 4 (Correct)</option>
                </select>

                <select
                  value={questionForm.difficulty}
                  onChange={(e) => setQuestionForm({...questionForm, difficulty: e.target.value})}
                  className="w-full p-3 rounded-lg bg-secondary/40 border border-border"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <textarea
                placeholder="Explanation (Optional)"
                value={questionForm.explanation}
                onChange={(e) => setQuestionForm({...questionForm, explanation: e.target.value})}
                className="w-full p-3 rounded-lg bg-secondary/40 border border-border"
                rows="3"
              />

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/80 transition-colors"
                >
                  {editingItem ? 'Update Question' : 'Create Question'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowQuestionModal(false);
                    setEditingItem(null);
                    setQuestionForm({
                      questionText: "",
                      options: ["", "", "", ""],
                      correctOptionIndex: 0,
                      topic: "",
                      difficulty: "medium",
                      explanation: ""
                    });
                  }}
                  className="flex-1 py-2 bg-secondary/40 rounded-lg hover:bg-secondary/60 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminPage() {
  return (
    <ProtectedRoute adminOnly={true}>
      <AdminPanel />
    </ProtectedRoute>
  );
}