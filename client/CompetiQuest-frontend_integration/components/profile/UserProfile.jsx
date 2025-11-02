"use client";

import React, { useState, useEffect } from "react";
import {
  FiEdit2,
  FiChevronDown,
  FiChevronUp,
  FiCalendar,
  FiHelpCircle,
  FiClock,
} from "react-icons/fi";
import axios from "axios";
import { useTheme } from "../../app/context/ThemeContext";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";

let MotionDiv;
let MotionSpan;
let MotionButton;
let MotionCircle;

try {
  const motion = require("framer-motion");
  MotionDiv = motion.motion.div;
  MotionSpan = motion.motion.span;
  MotionButton = motion.motion.button;
  MotionCircle = motion.motion.circle;
} catch (error) {
  MotionDiv = ({ children, ...props }) => <div {...props}>{children}</div>;
  MotionSpan = ({ children, ...props }) => <span {...props}>{children}</span>;
  MotionButton = ({ children, ...props }) => (
    <button {...props}>{children}</button>
  );
  MotionCircle = (props) => <circle {...props} />;
}

export default function UserProfile() {
  const [openCategory, setOpenCategory] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const [quizStats, setQuizStats] = useState({
    totalQuizzes: 0,
    totalQuestions: 0,
    correctAnswers: 0,
    easyQuizzes: 0,
    mediumQuizzes: 0,
    hardQuizzes: 0,
    calendarData: []
  });
  const [loading, setLoading] = useState(true);
  const { darkMode } = useTheme();
  const { user } = useAuth();

  // Debug user data
  useEffect(() => {
    console.log('User data in profile:', user);
  }, [user]);

  useEffect(() => {
    if (user?._id) {
      fetchQuizData();
    }
  }, [user]);

  const fetchQuizData = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/quiz/history/${user._id}`);
      
      if (response.data.success) {
        const quizzes = response.data.quizAttempts;
        calculateQuizStats(quizzes);
      }
    } catch (error) {
      console.error("Error fetching quiz data:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateQuizStats = (quizzes) => {
    // Count difficulty levels from topic names (since we don't store level separately)
    let easyCount = 0, mediumCount = 0, hardCount = 0;
    
    quizzes.forEach(quiz => {
      // Simple logic: if topic contains certain keywords, classify difficulty
      const topic = quiz.topic?.toLowerCase() || '';
      if (topic.includes('easy') || topic.includes('basic') || topic.includes('beginner')) {
        easyCount++;
      } else if (topic.includes('hard') || topic.includes('advanced') || topic.includes('expert')) {
        hardCount++;
      } else {
        mediumCount++; // Default to medium
      }
    });

    // Calculate streaks
    const { currentStreak, maxStreak } = calculateStreaks(quizzes);
    
    const stats = {
      totalQuizzes: quizzes.length,
      totalQuestions: quizzes.reduce((sum, quiz) => sum + quiz.totalQuestions, 0),
      correctAnswers: quizzes.reduce((sum, quiz) => sum + quiz.score, 0),
      easyQuizzes: easyCount,
      mediumQuizzes: mediumCount,
      hardQuizzes: hardCount,
      currentStreak,
      maxStreak,
      calendarData: generateQuizCalendarData(quizzes)
    };
    
    setQuizStats(stats);
  };

  const calculateStreaks = (quizzes) => {
    if (quizzes.length === 0) return { currentStreak: 0, maxStreak: 0 };
    
    // Sort quizzes by date
    const sortedQuizzes = quizzes.sort((a, b) => 
      new Date(a.completed_at || a.attempted_at) - new Date(b.completed_at || b.attempted_at)
    );
    
    // Group quizzes by date
    const quizzesByDate = {};
    sortedQuizzes.forEach(quiz => {
      const date = new Date(quiz.completed_at || quiz.attempted_at).toDateString();
      if (!quizzesByDate[date]) quizzesByDate[date] = [];
      quizzesByDate[date].push(quiz);
    });
    
    const dates = Object.keys(quizzesByDate).sort((a, b) => new Date(a) - new Date(b));
    
    let currentStreak = 0;
    let maxStreak = 0;
    let tempStreak = 0;
    
    // Calculate streaks (consecutive days with quizzes)
    for (let i = 0; i < dates.length; i++) {
      if (i === 0) {
        tempStreak = 1;
      } else {
        const prevDate = new Date(dates[i - 1]);
        const currDate = new Date(dates[i]);
        const dayDiff = (currDate - prevDate) / (1000 * 60 * 60 * 24);
        
        if (dayDiff === 1) {
          tempStreak++;
        } else {
          tempStreak = 1;
        }
      }
      
      maxStreak = Math.max(maxStreak, tempStreak);
      
      // Check if this is current streak (recent activity)
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      if (dates[i] === today || dates[i] === yesterday) {
        currentStreak = tempStreak;
      }
    }
    
    return { currentStreak, maxStreak };
  };

  const generateQuizCalendarData = (quizzes) => {
    const months = [];
    const today = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);

    // Create quiz count map by date
    const quizCountByDate = {};
    quizzes.forEach(quiz => {
      const date = new Date(quiz.completed_at || quiz.attempted_at);
      const dateStr = date.toISOString().split('T')[0];
      quizCountByDate[dateStr] = (quizCountByDate[dateStr] || 0) + 1;
    });

    for (let m = new Date(sixMonthsAgo); m <= today; m.setMonth(m.getMonth() + 1)) {
      const monthName = m.toLocaleString("default", { month: "short" });
      const year = m.getFullYear();
      const daysInMonth = new Date(year, m.getMonth() + 1, 0).getDate();

      const days = [];
      for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${year}-${String(m.getMonth() + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
        const count = quizCountByDate[dateStr] || 0;
        days.push({ date: dateStr, day: d, count });
      }

      months.push({ name: monthName, year, days });
    }

    return months;
  };

  const primaryColor = "oklch(0.536 0.17 21.3)";

  const profile = {
    username: user?.username || "Guest User",
    solved: quizStats.correctAnswers,
    total: quizStats.totalQuestions,
    attempting: 0,
    streak: quizStats.currentStreak || 0,
    maxStreak: quizStats.maxStreak || 0,
    easy: { solved: quizStats.easyQuizzes, total: quizStats.easyQuizzes },
    medium: { solved: quizStats.mediumQuizzes, total: quizStats.mediumQuizzes },
    hard: { solved: quizStats.hardQuizzes, total: quizStats.hardQuizzes },
    topics: [
      {
        name: "Aptitude",
        solved: 85,
        total: 120,
        percentage: 71,
        color: primaryColor,
        subcategories: [
          { name: "Time and Work", solved: 15, total: 20, percentage: 75 },
          { name: "Probability", solved: 12, total: 18, percentage: 67 },
          { name: "Percentages", solved: 18, total: 22, percentage: 82 },
          {
            name: "Ratio and Proportion",
            solved: 22,
            total: 30,
            percentage: 73,
          },
          { name: "Ages", solved: 18, total: 30, percentage: 60 },
        ],
      },
      {
        name: "Reasoning",
        solved: 92,
        total: 150,
        percentage: 61,
        color: primaryColor,
        subcategories: [
          { name: "Logical Deduction", solved: 25, total: 35, percentage: 71 },
          {
            name: "Pattern Recognition",
            solved: 20,
            total: 40,
            percentage: 50,
          },
          { name: "Spatial Reasoning", solved: 18, total: 25, percentage: 72 },
          { name: "Verbal Reasoning", solved: 29, total: 50, percentage: 58 },
        ],
      },
      {
        name: "English",
        solved: 78,
        total: 100,
        percentage: 78,
        color: primaryColor,
        subcategories: [
          { name: "Grammar", solved: 30, total: 35, percentage: 86 },
          { name: "Vocabulary", solved: 25, total: 30, percentage: 83 },
          { name: "Comprehension", solved: 23, total: 35, percentage: 66 },
        ],
      },
      {
        name: "GK",
        solved: 45,
        total: 80,
        percentage: 56,
        color: primaryColor,
        subcategories: [
          { name: "History", solved: 15, total: 20, percentage: 75 },
          { name: "Geography", solved: 12, total: 25, percentage: 48 },
          { name: "Science", solved: 10, total: 20, percentage: 50 },
          { name: "Current Affairs", solved: 8, total: 15, percentage: 53 },
        ],
      },
      {
        name: "Programming",
        solved: 107,
        total: 200,
        percentage: 54,
        color: primaryColor,
        subcategories: [
          { name: "Data Structures", solved: 35, total: 60, percentage: 58 },
          { name: "Algorithms", solved: 28, total: 50, percentage: 56 },
          { name: "Databases", solved: 20, total: 40, percentage: 50 },
          { name: "System Design", solved: 24, total: 50, percentage: 48 },
        ],
      },
    ],
    calendarData: quizStats.calendarData,
  };



  // Function to get color intensity based on quiz count using red colors
  function getColorIntensity(count) {
    if (count === 0) return darkMode ? "bg-gray-700" : "bg-gray-100";
    if (count === 1) return "bg-red-200"; // Light red for 1 quiz
    if (count === 2) return "bg-red-300";
    if (count === 3) return "bg-red-400"; // Medium red for 3 quizzes
    if (count >= 4) return "bg-red-600"; // Dark red for 4+ quizzes
    return darkMode ? "bg-gray-700" : "bg-gray-100";
  }

  // Toggle category dropdown
  const toggleCategory = (index) => {
    if (openCategory === index) {
      setOpenCategory(null);
    } else {
      setOpenCategory(index);
    }
  };

  // Generate years for dropdown (current year and previous 2 years)
  const currentYear = new Date().getFullYear();
  const yearOptions = [currentYear, currentYear - 1, currentYear - 2];

  return (
    <div className="min-h-screen flex flex-col p-6  mt-20 md:p-10 lg:px-20 bg-background">
      {/* Top cards row */}
      <div className="flex flex-col lg:flex-row gap-6 w-full mb-6">
        {/* Left Profile Card */}

        <div
          className={`${
            darkMode ? "bg-secondary/50" : "bg-white"
          } rounded-2xl shadow-md p-4 md:p-6 flex items-center border border-border/50 w-full lg:w-1/2 `}
        >
          <img
            src="/profile_photo.png"
            alt="Profile Picture"
            className="md:w-28 md:h-28 rounded-full flex items-center justify-center bg-accent/20 ml-10"
          />
          <div className="ml-5 md:ml-8">
            <h2 className="text-lg md:text-xl font-semibold text-foreground">
              {user?.username || "Guest User"}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {user?.email || "Please login to see your email"}
            </p>
            <Link href="/profile/edit">
              <button className="mt-3 flex items-center gap-2 px-4 md:px-6 py-2 bg-accent/20 text-accent font-semibold rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors duration-300 text-sm md:text-base">
                <FiEdit2 size={14} />
                Edit Profile
              </button>
            </Link>
          </div>
        </div>

        {/* Progress Card */}
        <div
          className={`${
            darkMode ? "bg-secondary/35" : "bg-white"
          }  "text-accent font-semibold   rounded-xl shadow-sm pr-20 pl-20 pt-8 pb-4 flex items-center border border-border/40 w-full lg:w-1/2`}
        >
          {/* Circular Progress - Left side */}
          <div className="relative w-24 h-24 md:w-40 md:h-40 flex-shrink-0 ml-2">
            <svg
              className="w-full h-full transform -rotate-90"
              viewBox="0 0 120 120"
            >
              <circle
                cx="60"
                cy="60"
                r="52"
                className="stroke-[oklch(0.95_0.01_90)] dark:stroke-border"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="60"
                cy="60"
                r="52"
                className="stroke-accent transition-all duration-700 ease-out"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 52}
                strokeDashoffset={
                  2 * Math.PI * 52 -
                  (profile.solved / profile.total) * 2 * Math.PI * 52
                }
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
              <p className="text-lg md:text-xl font-bold text-foreground dark:text-white">
                {profile.solved}/{profile.total}
              </p>
              <p className="text-xs md:text-sm text-accent font-medium mt-1">
                ✓ Solved
              </p>
            </div>
          </div>

          {/* Difficulty Stats - Right side */}
          <div className="flex-1 ml-30 ">
            <div className="flex flex-col gap-2 md:gap-3 ">
              <div className="text-center bg-accent/12 font-semibold rounded-lg w-30">
                <div className="">
                  <span className="text-sm md:text-base text-accent dark:text-accent">
                    Easy
                  </span>
                </div>
                <span className="text-xs md:text-sm font-normal text-muted-foreground">
                  {profile.easy.solved}
                </span>
              </div>

              <div className="text-center bg-accent/12 font-semibold rounded-lg w-30">
                <div className="">
                  <span className="text-sm md:text-base font-bold text-accent dark:text-accent">
                    Medium
                  </span>
                </div>
                <span className="text-xs md:text-sm font-normal text-muted-foreground">
                  {profile.medium.solved}
                </span>
              </div>

              <div className="text-center bg-accent/12 font-semibold rounded-lg w-30">
                <div className="">
                  <span className="text-sm md:text-base font-bold text-accent dark:text-accent">
                    Hard
                  </span>
                </div>
                <span className="text-xs md:text-sm font-normal text-muted-foreground">
                  {profile.hard.solved}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Section */}
      <div
        className={`w-full ${
          darkMode ? "bg-secondary/35" : "bg-white"
        } rounded-2xl shadow-md p-6 border border-border/50 mb-6`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <FiCalendar className="mr-2 text-accent" />
            <h3 className="text-lg font-semibold text-foreground">
              Quiz Activity Calendar
            </h3>
          </div>

          {/* Wrapper for right-aligned items */}
          <div className="flex items-center gap-6">
            {/* Streaks Container */}
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Current streak:
                  <span className="ml-2 text-lg font-bold text-foreground">
                    {profile.streak}
                  </span>
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Max streak:
                  <span className="ml-2 text-lg font-bold text-foreground">
                    {profile.maxStreak}
                  </span>
                </p>
              </div>
            </div>

            {/* Year Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowYearDropdown(!showYearDropdown)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border/50 bg-white dark:bg-accent text-foreground"
              >
                {selectedYear}
                <FiChevronDown />
              </button>

              {showYearDropdown && (
                <div className="absolute right-0 mt-1 w-full bg-white dark:bg-accent border border-border/50 rounded-lg shadow-lg z-10">
                  {yearOptions.slice(0, 2).map((year) => (
                    <button
                      key={year}
                      onClick={() => {
                        setSelectedYear(year);
                        setShowYearDropdown(false);
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-accent/10 text-foreground"
                    >
                      {year}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="pb-2">
          <div className="flex gap-3 justify-evenly">
            {profile.calendarData.map((month, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
                <div className="text-xs font-medium mb-1 text-foreground">
                  {month.name}
                </div>

                {/* Show date numbers instead of question counts */}
                <div className="grid grid-cols-6 gap-1">
                  {month.days.map((day, dayIndex) => (
                    <div
                      key={dayIndex}
                      className={`w-5 h-5 rounded-sm flex items-center justify-center text-[10px] ${getColorIntensity(
                        day.count
                      )} ${darkMode ? "text-white" : "text-foreground"}`}
                      title={`${day.date}: ${day.count} quizzes taken`}
                    >
                      {day.day}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quiz History Section */}
      <div
        className={`w-full ${
          darkMode ? "bg-secondary/35" : "bg-white"
        } rounded-2xl shadow-md p-6 border border-border/50 mb-6`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <FiHelpCircle className="mr-2 text-accent" />
            <h3 className="text-lg font-semibold text-foreground">
              Quiz History
            </h3>
          </div>
          <Link href="/quiz">
            <button className="px-4 py-2 bg-accent/20 text-accent font-semibold rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors duration-300 text-sm">
              Take New Quiz
            </button>
          </Link>
        </div>

        <div className="text-center py-8">
          <FiHelpCircle className="text-4xl text-accent mx-auto mb-3" />
          <h4 className="text-lg font-semibold mb-2 text-foreground">Quiz Results</h4>
          <p className="text-muted-foreground mb-4">View your past quiz attempts and scores</p>
          <Link href="/quiz/history">
            <button className="px-6 py-3 bg-accent text-accent-foreground rounded-lg hover:bg-accent/80 transition-colors duration-300 font-medium">
              View Past Quiz Results
            </button>
          </Link>
        </div>
      </div>

      {/* Topic Coverage Section */}
      <div className="w-full">
        <h3 className="text-xl font-semibold mb-4 text-foreground">
          Topic Coverage
        </h3>
        <div className="space-y-4">
          {profile.topics.map((topic, index) => (
            <div
              key={index}
              className={`${
                darkMode ? "bg-secondary/35" : "bg-white"
              } rounded-2xl shadow-md overflow-hidden border border-border/50`}
            >
              <button
                className="w-full p-4 flex justify-between items-center text-left hover:bg-accent/10 transition-colors duration-300"
                onClick={() => toggleCategory(index)}
                style={{
                  backgroundColor:
                    openCategory === index
                      ? `${primaryColor}20`
                      : "transparent",
                }}
              >
                <div className="flex items-center">
                  <div className="relative w-5 h-5 mr-3">
                    <svg className="w-5 h-5 transform -rotate-90">
                      <circle
                        cx="10"
                        cy="10"
                        r="8"
                        stroke="blue"
                        strokeWidth="2"
                        fill="none"
                      />
                      <circle
                        cx="10"
                        cy="10"
                        r="8"
                        stroke={primaryColor}
                        strokeWidth="2"
                        fill="none"
                        strokeDasharray={2 * Math.PI * 8}
                        strokeDashoffset={
                          2 * Math.PI * 8 -
                          (topic.percentage / 100) * 2 * Math.PI * 8
                        }
                      />
                    </svg>
                  </div>
                  <span className="font-medium text-foreground">
                    {topic.name}
                  </span>
                </div>
                <div className="flex items-center">
                  <span
                    className="text-sm font-semibold mr-3"
                    style={{ color: primaryColor }}
                  >
                    {topic.percentage}%
                  </span>
                  {openCategory === index ? (
                    <FiChevronUp className="text-muted-foreground" />
                  ) : (
                    <FiChevronDown className="text-muted-foreground" />
                  )}
                </div>
              </button>

              {openCategory === index && (
                <MotionDiv
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="px-4 pb-4"
                >
                  {topic.subcategories.map((subtopic, subIndex) => (
                    <div
                      key={subIndex}
                      className={`px-6 py-3 ${
                        darkMode ? "bg-accent/8" : "bg-accent/10"
                      } text-muted-foreground rounded-lg mb-3 transition-colors duration-300 hover:bg-accent hover:text-accent-foreground group`}
                      onMouseEnter={() => {
                        const progressBar = document.getElementById(
                          `progress-${index}-${subIndex}`
                        );
                        if (progressBar) {
                          progressBar.style.backgroundColor = darkMode
                            ? "oklch(0.232 0.015 30)"
                            : "oklch(1 0 0)";
                          progressBar.style.opacity = "1";
                        }
                      }}
                      onMouseLeave={() => {
                        const progressBar = document.getElementById(
                          `progress-${index}-${subIndex}`
                        );
                        if (progressBar) {
                          progressBar.style.backgroundColor = darkMode
                            ? "oklch(var(--secondary))"
                            : primaryColor;
                          progressBar.style.opacity = "0.7";
                        }
                      }}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">{subtopic.name}</span>
                        <span className="text-sm font-semibold">
                          {subtopic.percentage}%
                        </span>
                      </div>
                      <div className="w-full bg-accent/30 rounded-full h-2 overflow-hidden">
                        <div
                          id={`progress-${index}-${subIndex}`}
                          className="h-2 rounded-full transition-all duration-500"
                          style={{
                            backgroundColor: primaryColor,
                            width: `${subtopic.percentage}%`,
                            opacity: 0.7,
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-xs mt-1">
                        <span>{subtopic.solved} solved</span>
                        <span>{subtopic.total} total</span>
                      </div>
                    </div>
                  ))}
                </MotionDiv>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
