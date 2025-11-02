"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { FaArrowLeft, FaClock } from "react-icons/fa";

const QuizTaking = ({ quizData, onQuizCompleted, onBack }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Initialize answers array
    setAnswers(new Array(quizData.questions.length).fill({ selectedOption: null }));
  }, [quizData]);

  useEffect(() => {
    // Timer countdown
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (optionIndex) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = { selectedOption: optionIndex };
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < quizData.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/quiz/submit`, {
        quizAttemptId: quizData.quizAttemptId,
        answers: answers
      });

      if (response.data.success) {
        toast.success("Quiz submitted successfully!");
        onQuizCompleted(response.data);
      }
    } catch (error) {
      console.error("Quiz submission error:", error);
      toast.error(error.response?.data?.message || "Failed to submit quiz");
    } finally {
      setLoading(false);
    }
  };

  const question = quizData.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quizData.questions.length) * 100;

  return (
    <div className="w-full h-full flex flex-col p-8 bg-muted/10 backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <FaArrowLeft /> Back
        </button>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-accent">
            <FaClock />
            <span className="font-mono text-lg">{formatTime(timeLeft)}</span>
          </div>
          
          <div className="text-sm text-muted-foreground">
            Question {currentQuestion + 1} of {quizData.questions.length}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-secondary/40 rounded-full h-2 mb-8">
        <div 
          className="bg-accent h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Question */}
      <div className="flex-1 flex flex-col">
        <h2 className="text-2xl font-bold mb-8 text-foreground">
          {question.description}
        </h2>

        {/* Options */}
        <div className="space-y-4 mb-8">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(index)}
              className={`w-full p-4 text-left rounded-lg border transition-all duration-300 ${
                answers[currentQuestion]?.selectedOption === index
                  ? "bg-accent/20 border-accent text-accent"
                  : "bg-secondary/40 border-border hover:bg-secondary/60"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  answers[currentQuestion]?.selectedOption === index
                    ? "border-accent bg-accent"
                    : "border-muted-foreground"
                }`}>
                  {answers[currentQuestion]?.selectedOption === index && (
                    <div className="w-2 h-2 rounded-full bg-accent-foreground" />
                  )}
                </div>
                <span className="text-lg">{String.fromCharCode(65 + index)}. {option}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="px-6 py-2 rounded-lg bg-secondary/40 border border-border hover:bg-secondary/60 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
          >
            Previous
          </button>

          <div className="flex gap-2">
            {quizData.questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestion(index)}
                className={`w-8 h-8 rounded-full text-sm font-medium transition-all duration-300 ${
                  index === currentQuestion
                    ? "bg-accent text-accent-foreground"
                    : answers[index]?.selectedOption !== null
                    ? "bg-accent/20 text-accent border border-accent"
                    : "bg-secondary/40 text-muted-foreground border border-border"
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          {currentQuestion === quizData.questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`px-6 py-2 rounded-lg font-semibold transition-all duration-300 ${
                loading
                  ? "bg-accent/50 text-muted-foreground cursor-not-allowed"
                  : "bg-accent text-accent-foreground hover:bg-accent/80"
              }`}
            >
              {loading ? "Submitting..." : "Submit Quiz"}
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={currentQuestion === quizData.questions.length - 1}
              className="px-6 py-2 rounded-lg bg-accent text-accent-foreground hover:bg-accent/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizTaking;