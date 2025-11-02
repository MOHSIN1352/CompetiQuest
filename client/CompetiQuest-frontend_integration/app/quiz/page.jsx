"use client";
import { useState } from "react";
import Squares from "@/components/home/Squares";
import QuizGenerator from "@/components/quiz/QuizGenerator";
import QuizTaking from "@/components/quiz/QuizTaking";
import QuizResults from "@/components/quiz/QuizResults";

export default function QuizPage() {
  const [themeColors, setThemeColors] = useState({
    border: "oklch(0.15 0 0 / 0.1)",
    hover: "#222",
  });

  const [currentStep, setCurrentStep] = useState("generate"); // generate, taking, results
  const [quizData, setQuizData] = useState(null);
  const [quizResults, setQuizResults] = useState(null);

  const handleQuizGenerated = (data) => {
    setQuizData(data);
    setCurrentStep("taking");
  };

  const handleQuizCompleted = (results) => {
    setQuizResults(results);
    setCurrentStep("results");
  };

  const handleStartNew = () => {
    setCurrentStep("generate");
    setQuizData(null);
    setQuizResults(null);
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

      <div className="relative w-full max-w-4xl bg-muted/40 rounded-2xl overflow-hidden shadow-md p-6 shadow-accent">
        {currentStep === "generate" && (
          <QuizGenerator onQuizGenerated={handleQuizGenerated} />
        )}
        
        {currentStep === "taking" && quizData && (
          <QuizTaking 
            quizData={quizData} 
            onQuizCompleted={handleQuizCompleted}
            onBack={() => setCurrentStep("generate")}
          />
        )}
        
        {currentStep === "results" && quizResults && (
          <QuizResults 
            results={quizResults} 
            onStartNew={handleStartNew}
          />
        )}
      </div>
    </div>
  );
}