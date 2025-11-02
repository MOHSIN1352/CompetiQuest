"use client";
import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "@/app/context/AuthContext";

const QuizGenerator = ({ onQuizGenerated }) => {
  const [formData, setFormData] = useState({
    topic: "",
    numberOfQuestions: 5,
    level: "medium"
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { user } = useAuth();

  const validate = () => {
    const newErrors = {};
    
    if (!formData.topic.trim()) {
      newErrors.topic = "Topic is required";
    }
    
    if (formData.numberOfQuestions < 1 || formData.numberOfQuestions > 20) {
      newErrors.numberOfQuestions = "Questions must be between 1 and 20";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      toast.error("Please fix the errors before submitting.");
      return;
    }

    if (!user?._id) {
      toast.error("Please login to generate quiz");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/quiz/generate`, {
        userId: user._id,
        topic: formData.topic,
        numberOfQuestions: formData.numberOfQuestions,
        level: formData.level
      });

      if (response.data.success) {
        toast.success("Quiz generated successfully!");
        onQuizGenerated(response.data);
      }
    } catch (error) {
      console.error("Quiz generation error:", error);
      toast.error(error.response?.data?.message || "Failed to generate quiz");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-muted/10 backdrop-blur-xl">
      <h2 className="text-3xl font-bold mb-8 text-center">Generate AI Quiz</h2>
      
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
        {/* Topic Input */}
        <div className="relative w-full">
          <input
            type="text"
            value={formData.topic}
            onChange={(e) => setFormData({...formData, topic: e.target.value})}
            placeholder="Enter topic (e.g., JavaScript, Python, Math)"
            className={`w-full bg-secondary/40 border ${
              errors.topic ? "border-red-500" : "border-border"
            } rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-300`}
          />
          {errors.topic && (
            <p className="text-red-500 text-sm mt-1">{errors.topic}</p>
          )}
        </div>

        {/* Number of Questions */}
        <div className="relative w-full">
          <label className="block text-sm font-medium mb-2 text-foreground">
            Number of Questions
          </label>
          <select
            value={formData.numberOfQuestions}
            onChange={(e) => setFormData({...formData, numberOfQuestions: parseInt(e.target.value)})}
            className={`w-full bg-secondary/40 border ${
              errors.numberOfQuestions ? "border-red-500" : "border-border"
            } rounded-lg px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-300`}
          >
            <option value={3}>3 Questions</option>
            <option value={5}>5 Questions</option>
            <option value={10}>10 Questions</option>
            <option value={15}>15 Questions</option>
            <option value={20}>20 Questions</option>
          </select>
          {errors.numberOfQuestions && (
            <p className="text-red-500 text-sm mt-1">{errors.numberOfQuestions}</p>
          )}
        </div>

        {/* Difficulty Level */}
        <div className="relative w-full">
          <label className="block text-sm font-medium mb-2 text-foreground">
            Difficulty Level
          </label>
          <select
            value={formData.level}
            onChange={(e) => setFormData({...formData, level: e.target.value})}
            className="w-full bg-secondary/40 border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-300"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        {/* Generate Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded-xl font-semibold text-accent-foreground transition-colors duration-300 ${
            loading
              ? "bg-accent/50 text-muted-foreground cursor-not-allowed"
              : "bg-accent hover:bg-accent/50 hover:text-accent"
          }`}
        >
          {loading ? "Generating Quiz..." : "Generate Quiz"}
        </button>
      </form>

      {/* Info Text */}
      <p className="text-muted-foreground text-sm mt-6 text-center max-w-md">
        AI will generate personalized questions based on your topic and difficulty level.
      </p>
    </div>
  );
};

export default QuizGenerator;