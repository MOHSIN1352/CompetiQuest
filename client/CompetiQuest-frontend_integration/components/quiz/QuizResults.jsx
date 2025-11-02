"use client";
import { FaCheckCircle, FaTimesCircle, FaTrophy, FaRedo } from "react-icons/fa";

const QuizResults = ({ results, onStartNew }) => {
  const getScoreColor = (percentage) => {
    if (percentage >= 80) return "text-green-500";
    if (percentage >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getScoreMessage = (percentage) => {
    if (percentage >= 90) return "Excellent! 🎉";
    if (percentage >= 80) return "Great job! 👏";
    if (percentage >= 70) return "Good work! 👍";
    if (percentage >= 60) return "Not bad! 📚";
    return "Keep practicing! 💪";
  };

  return (
    <div className="w-full h-full flex flex-col p-8 bg-muted/10 backdrop-blur-xl">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <FaTrophy className="text-6xl text-accent" />
        </div>
        <h2 className="text-3xl font-bold mb-2">Quiz Completed!</h2>
        <p className="text-muted-foreground">Here are your results</p>
      </div>

      {/* Score Summary */}
      <div className="bg-secondary/40 rounded-xl p-6 mb-8 text-center">
        <div className={`text-6xl font-bold mb-2 ${getScoreColor(results.percentage)}`}>
          {results.percentage}%
        </div>
        <div className="text-xl mb-2">
          {results.score} out of {results.totalQuestions} correct
        </div>
        <div className="text-lg text-accent font-medium">
          {getScoreMessage(results.percentage)}
        </div>
      </div>

      {/* Detailed Results */}
      <div className="flex-1 overflow-y-auto mb-6">
        <h3 className="text-xl font-semibold mb-4">Question Review</h3>
        <div className="space-y-4">
          {results.results.map((result, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${
                result.isCorrect
                  ? "bg-green-500/10 border-green-500/30"
                  : "bg-red-500/10 border-red-500/30"
              }`}
            >
              <div className="flex items-start gap-3 mb-3">
                {result.isCorrect ? (
                  <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                ) : (
                  <FaTimesCircle className="text-red-500 mt-1 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <h4 className="font-medium mb-2">
                    Q{index + 1}: {result.question}
                  </h4>
                  
                  <div className="space-y-2 text-sm">
                    {result.options.map((option, optIndex) => (
                      <div
                        key={optIndex}
                        className={`p-2 rounded ${
                          optIndex === result.correctAnswer
                            ? "bg-green-500/20 text-green-400 font-medium"
                            : optIndex === result.userAnswer && !result.isCorrect
                            ? "bg-red-500/20 text-red-400"
                            : "text-muted-foreground"
                        }`}
                      >
                        {String.fromCharCode(65 + optIndex)}. {option}
                        {optIndex === result.correctAnswer && " ✓"}
                        {optIndex === result.userAnswer && optIndex !== result.correctAnswer && " ✗"}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4 justify-center">
        <button
          onClick={onStartNew}
          className="flex items-center gap-2 px-6 py-3 bg-accent text-accent-foreground rounded-lg hover:bg-accent/80 transition-colors duration-300 font-medium"
        >
          <FaRedo />
          Take Another Quiz
        </button>
        
        <button
          onClick={() => window.location.href = '/profile'}
          className="px-6 py-3 bg-secondary/40 border border-border rounded-lg hover:bg-secondary/60 transition-colors duration-300 font-medium"
        >
          View History
        </button>
      </div>
    </div>
  );
};

export default QuizResults;