"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Squares from "@/components/home/Squares";
import { useAuth } from "@/app/context/AuthContext";
import { FaTrophy, FaClock, FaBook, FaArrowLeft } from "react-icons/fa";

export default function QuizHistory() {
  const [themeColors, setThemeColors] = useState({
    border: "oklch(0.15 0 0 / 0.1)",
    hover: "#222",
  });

  const [quizHistory, setQuizHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user?._id) {
      fetchQuizHistory();
    }
  }, [user]);

  const fetchQuizHistory = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/quiz/history/${user._id}`);
      
      if (response.data.success) {
        setQuizHistory(response.data.quizAttempts);
      }
    } catch (error) {
      console.error("Error fetching quiz history:", error);
      toast.error("Failed to load quiz history");
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return "text-green-500";
    if (percentage >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

      <div className="relative w-full max-w-6xl bg-muted/40 rounded-2xl overflow-hidden shadow-md p-6 shadow-accent">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <FaArrowLeft /> Back
            </button>
            <h1 className="text-3xl font-bold">Quiz History</h1>
          </div>
          
          <button
            onClick={() => window.location.href = '/quiz'}
            className="px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/80 transition-colors duration-300"
          >
            Take New Quiz
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-lg text-muted-foreground">Loading quiz history...</div>
          </div>
        ) : quizHistory.length === 0 ? (
          <div className="text-center py-16">
            <FaBook className="text-6xl text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">No Quiz History</h2>
            <p className="text-muted-foreground mb-6">You haven't taken any quizzes yet.</p>
            <button
              onClick={() => window.location.href = '/quiz'}
              className="px-6 py-3 bg-accent text-accent-foreground rounded-lg hover:bg-accent/80 transition-colors duration-300"
            >
              Take Your First Quiz
            </button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {quizHistory.map((quiz, index) => (
              <div
                key={quiz._id}
                className="bg-secondary/40 rounded-xl p-6 border border-border hover:bg-secondary/60 transition-all duration-300"
              >
                <div className="flex items-center gap-2 mb-4">
                  <FaBook className="text-accent" />
                  <h3 className="font-semibold text-lg truncate">{quiz.topic}</h3>
                </div>

                <div className="text-center mb-4">
                  <div className={`text-3xl font-bold ${getScoreColor(quiz.percentage)}`}>
                    {Math.round(quiz.percentage)}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {quiz.score}/{quiz.totalQuestions} correct
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Questions:</span>
                    <span>{quiz.totalQuestions}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Status:</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      quiz.status === 'completed' 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {quiz.status}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FaClock />
                  <span>{formatDate(quiz.completed_at || quiz.attempted_at)}</span>
                </div>

                {quiz.percentage >= 90 && (
                  <div className="mt-4 flex items-center gap-2 text-yellow-500">
                    <FaTrophy />
                    <span className="text-sm font-medium">Excellent!</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {quizHistory.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-secondary/40 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-accent">
                {quizHistory.length}
              </div>
              <div className="text-sm text-muted-foreground">Total Quizzes</div>
            </div>
            
            <div className="bg-secondary/40 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-green-500">
                {Math.round(quizHistory.reduce((acc, quiz) => acc + quiz.percentage, 0) / quizHistory.length)}%
              </div>
              <div className="text-sm text-muted-foreground">Average Score</div>
            </div>
            
            <div className="bg-secondary/40 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-yellow-500">
                {Math.max(...quizHistory.map(quiz => quiz.percentage))}%
              </div>
              <div className="text-sm text-muted-foreground">Best Score</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}