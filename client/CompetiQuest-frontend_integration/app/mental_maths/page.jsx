// app/mental_maths/page.jsx
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiPlay, FiClock, FiCheckCircle, FiXCircle } from "react-icons/fi"; // FiXCircle is used for the new Exit button

// A modern, reusable button component
const ActionButton = ({ onClick, children, className = "" }) => (
  <button
    onClick={onClick}
    className={`px-6 py-3 font-bold text-lg rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${className}`}
  >
    {children}
  </button>
);

// Main component for the Mental Maths page
export default function MentalMathsPage() {
  // Game state can be: 'settings', 'countdown', 'playing', 'finished'
  const [gameState, setGameState] = useState("settings");

  // State for user-configurable settings
  const [settings, setSettings] = useState({
    operations: ["+", "-"],
    range: { min: 2, max: 20 },
    duration: 60, // in seconds
  });

  // State for the game itself
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(settings.duration);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [userInput, setUserInput] = useState("");
  const [countdown, setCountdown] = useState(3);

  // Memoize available operations to prevent re-renders
  const availableOperations = useMemo(
    () => [
      { label: "Addition", value: "+" },
      { label: "Subtraction", value: "-" },
      { label: "Multiplication", value: "x" },
      { label: "Division", value: "÷" },
    ],
    []
  );

  // --- Helper Functions ---

  const generateQuestion = useCallback(() => {
    const { operations, range } = settings;
    if (operations.length === 0) return null;

    const operation = operations[Math.floor(Math.random() * operations.length)];
    let num1 =
      Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
    let num2 =
      Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
    let answer;

    switch (operation) {
      case "+":
        answer = num1 + num2;
        break;
      case "-":
        if (num1 < num2) [num1, num2] = [num2, num1]; // Ensure result isn't negative
        answer = num1 - num2;
        break;
      case "x":
        answer = num1 * num2;
        break;
      case "÷":
        if (num2 === 0) num2 = 1; // Avoid division by zero
        if (num1 < num2) [num1, num2] = [num2, num1];

        const rawAnswer = num1 / num2;
        answer = Math.round(rawAnswer * 100) / 100;
        break;
      default:
        return;
    }

    setCurrentQuestion({ num1, num2, operation, answer });
  }, [settings]);

  // --- Effects ---

  // Timer effect for the main game
  useEffect(() => {
    if (gameState === "playing" && timeLeft > 0) {
      const timerId = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearInterval(timerId);
    } else if (timeLeft === 0) {
      setGameState("finished");
    }
  }, [gameState, timeLeft]);

  // Countdown timer effect
  useEffect(() => {
    if (gameState === "countdown") {
      if (countdown > 0) {
        const timerId = setTimeout(
          () => setCountdown((prev) => prev - 1),
          1000
        );
        return () => clearTimeout(timerId);
      } else {
        setGameState("playing");
        generateQuestion();
      }
    }
  }, [gameState, countdown, generateQuestion]);

  // --- Event Handlers ---

  const handleStartGame = () => {
    if (settings.operations.length === 0) {
      alert("Please select at least one operation to start.");
      return;
    }
    setTimeLeft(settings.duration);
    setScore(0);
    setUserInput("");
    setCountdown(3);
    setGameState("countdown");
  };

  const handleReset = () => {
    setGameState("settings");
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setUserInput(value);

    if (parseFloat(value) === currentQuestion?.answer) {
      setScore((prev) => prev + 1);
      generateQuestion();
      setUserInput("");
    }
  };

  const toggleOperation = (op) => {
    setSettings((prev) => {
      const newOps = prev.operations.includes(op)
        ? prev.operations.filter((o) => o !== op)
        : [...prev.operations, op];
      return { ...prev, operations: newOps };
    });
  };

  // --- UI Components ---

  const renderSettings = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 max-w-2xl mx-auto"
    >
      <h1 className="text-4xl font-bold text-center text-foreground">
        Mental Maths Challenge
      </h1>
      <p className="text-center text-muted-foreground">
        Sharpen your mind. Select your challenge and press play!
      </p>

      {/* Operations */}
      <div className="bg-secondary/40 p-6 rounded-2xl border border-border/50 shadow-lg">
        <h2 className="font-bold text-accent mb-4 text-xl">Operations</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {availableOperations.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => toggleOperation(value)}
              className={`p-4 rounded-lg text-left transition-all duration-300 border-2 ${
                settings.operations.includes(value)
                  ? "border-accent bg-accent/20"
                  : "border-border hover:border-accent hover:bg-accent/10"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Ranges & Duration */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-secondary/40 p-6 rounded-2xl border border-border/50 shadow-lg">
          <h2 className="font-bold text-accent mb-4 text-xl">Number Range</h2>
          <div className="flex items-center gap-4">
            <input
              type="number"
              value={settings.range.min}
              onChange={(e) =>
                setSettings((s) => ({
                  ...s,
                  range: { ...s.range, min: parseInt(e.target.value) || 0 },
                }))
              }
              className="w-full p-2 bg-secondary rounded-md border-2 border-border focus:border-accent focus:outline-none"
            />
            <span className="text-muted-foreground">to</span>
            <input
              type="number"
              value={settings.range.max}
              onChange={(e) =>
                setSettings((s) => ({
                  ...s,
                  range: { ...s.range, max: parseInt(e.target.value) || 0 },
                }))
              }
              className="w-full p-2 bg-secondary rounded-md border-2 border-border focus:border-accent focus:outline-none"
            />
          </div>
        </div>
        <div className="bg-secondary/40 p-6 rounded-2xl border border-border/50 shadow-lg">
          <h2 className="font-bold text-accent mb-4 text-xl">Duration</h2>
          <div className="flex justify-around">
            {[60, 120, 180].map((d) => (
              <button
                key={d}
                onClick={() => setSettings((s) => ({ ...s, duration: d }))}
                className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                  settings.duration === d
                    ? "border-accent bg-accent/20"
                    : "border-border hover:border-accent"
                }`}
              >
                {d}s
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-center pt-4">
        <ActionButton
          onClick={handleStartGame}
          className="bg-accent text-accent-foreground hover:bg-accent/90 cursor-pointer"
        >
          <FiPlay /> Start Challenge
        </ActionButton>
      </div>
    </motion.div>
  );

  const renderCountdown = () => (
    <div className="flex flex-col items-center justify-center h-full">
      <p className="text-2xl text-muted-foreground mb-4">Starts in</p>
      <AnimatePresence>
        <motion.div
          key={countdown}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 1.5, opacity: 0 }}
          transition={{ duration: 0.9 }}
          className="text-8xl font-bold text-accent"
        >
          {countdown > 0 ? countdown : "Go!"}
        </motion.div>
      </AnimatePresence>
    </div>
  );

  const renderGame = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto text-center"
    >
      <div className="flex justify-between items-center mb-12 p-4 bg-secondary/40 rounded-xl border border-border/50">
        <div className="flex items-center gap-2 text-xl font-bold text-foreground">
          <FiCheckCircle className="text-green-500" /> Score: {score}
        </div>
        <div className="flex items-center gap-2 text-xl font-bold text-accent">
          <FiClock /> Time: {Math.floor(timeLeft / 60)}:
          {(timeLeft % 60).toString().padStart(2, "0")}
        </div>
      </div>

      {currentQuestion && (
        <div className="my-16">
          <p className="text-7xl font-mono tracking-wider text-foreground">
            {currentQuestion.num1} {currentQuestion.operation}{" "}
            {currentQuestion.num2} =
          </p>
        </div>
      )}

      <input
        type="number"
        step="any"
        autoFocus
        value={userInput}
        onChange={handleInputChange}
        className="w-1/2 p-4 text-4xl text-center bg-transparent border-b-4 border-border focus:border-accent focus:outline-none transition-colors"
      />

      {/* UPDATED: Exit button now uses ActionButton for consistent styling */}
      <div className="mt-16 flex justify-center">
        <ActionButton
          onClick={() => setGameState("finished")}
          className="bg-accent text-accent-foreground hover:bg-accent/90 cursor-pointer"
        >
          <FiXCircle />
          <span>Exit</span>
        </ActionButton>
      </div>
    </motion.div>
  );

  const renderFinished = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center bg-secondary/40 p-10 rounded-2xl border border-border/50 shadow-lg max-w-md mx-auto"
    >
      <h2 className="text-3xl font-bold text-accent">Challenge Over!</h2>
      <p className="mt-4 text-lg text-muted-foreground">Well done!</p>
      <div className="my-8 text-5xl font-bold text-foreground">
        Final Score: {score}
      </div>
      {/* UPDATED: Wrapped button in a flex container to ensure centering */}
      <div className="flex justify-center">
        <ActionButton
          onClick={handleReset}
          className="bg-accent text-accent-foreground hover:bg-accent/90 cursor-pointer"
        >
          Play Again
        </ActionButton>
      </div>
    </motion.div>
  );

  return (
    <main className="container mx-auto px-4 py-16 flex items-center justify-center min-h-screen bg-background">
      {gameState === "settings" && renderSettings()}
      {gameState === "countdown" && renderCountdown()}
      {gameState === "playing" && renderGame()}
      {gameState === "finished" && renderFinished()}
    </main>
  );
}
