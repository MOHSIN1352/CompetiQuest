// components/qna/QuestionLayout.jsx
"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  FiChevronLeft,
  FiChevronRight,
  FiChevronsLeft,
  FiChevronsRight,
  FiMoreHorizontal,
} from "react-icons/fi";

/* ---------- Question Card ---------- */
const Question = ({
  q,
  index,
  page,
  selectedAnswers,
  handleSelectAnswer,
  showExplanation,
  toggleExplanation,
}) => {
  console.log("this is question object:", q);
  console.log("this is selected Ans:", selectedAnswers);
  console.log("this is showExplanation object:", showExplanation);
  console.log("this is toggleExplanation object:", toggleExplanation);
  const questionId = q._id; // ✅ ensure a unique key
  const isSelected = selectedAnswers[questionId];
  const isCorrect = isSelected === q.correctOptionIndex;
  return (
    <motion.div
      key={q.id}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="bg-secondary/40 p-6 rounded-2xl border border-border/50 shadow-lg"
    >
      <p className="mb-6 text-lg leading-relaxed">
        <span className="font-bold text-accent mr-2">
          {(page - 1) * 5 + index + 1}.
        </span>
        {q.questionText}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {q.options.map((option, i) => {
          const isThisOptionSelected = selectedAnswers[questionId] === i;
          const isThisCorrect = i === q.correctOptionIndex;

          return (
            <button
              key={option}
              onClick={() => handleSelectAnswer(questionId, i)}
              className={`p-4 rounded-lg text-left transition-all duration-300 border-2 ${
                isThisOptionSelected
                  ? isThisCorrect
                    ? "border-green-500 bg-green-500/20"
                    : "border-red-500 bg-red-500/20"
                  : "border-border hover:border-accent hover:bg-accent/10"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>

      {isSelected !== undefined && (
        <div className="mt-4">
          <p
            className={`font-bold ${
              isCorrect ? "text-green-500" : "text-red-500"
            }`}
          >
            {isCorrect
              ? "Correct!"
              : `Correct Answer: ${q.correctOptionIndex + 1}`}
          </p>

          <button
            onClick={() => toggleExplanation(questionId)}
            className="text-accent hover:underline mt-2"
          >
            {showExplanation[questionId] ? "Hide" : "Show"} Explanation
          </button>

          {showExplanation[questionId] && (
            <p className="mt-2 p-4 bg-accent/10 rounded-lg text-muted-foreground">
              {q.explanation}
            </p>
          )}
        </div>
      )}
    </motion.div>
  );
};

/* ---------- Pagination ---------- */
const Pagination = ({
  page,
  totalItems,
  itemsPerPage = 5,
  onPageChange, // required: (newPage:number)=>void
}) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  // Build the compact sequence like: 1 2 3 4 5 ... 10
  const buildPages = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    pages.push(1);

    const start = Math.max(2, Math.min(page - 2, totalPages - 5));
    const end = Math.min(totalPages - 1, Math.max(page + 2, 5));

    if (start > 2) pages.push("...");
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages - 1) pages.push("...");

    pages.push(totalPages);
    return pages;
  };

  const pages = buildPages();

  const baseBtn =
    "w-10 h-10 grid place-items-center rounded-md border-2 bg-transparent transition-colors";
  const idle = "border-border hover:border-accent hover:text-accent";
  const active = "border-accent text-accent";
  const iconBtn =
    "w-10 h-10 grid place-items-center rounded-md border-2 border-border hover:border-accent hover:text-accent transition-colors";

  return (
    <nav
      aria-label="Pagination"
      className="flex justify-center items-center mt-16 gap-2 select-none"
    >
      {/* << go to first & < previous (hidden on page 1) */}
      {page > 1 && (
        <>
          <button
            aria-label="Go to first page"
            className={iconBtn}
            onClick={() => onPageChange(1)}
          >
            <FiChevronsLeft />
          </button>
          <button
            aria-label="Previous page"
            className={iconBtn}
            onClick={() => onPageChange(page - 1)}
          >
            <FiChevronLeft />
          </button>
        </>
      )}

      {/* numbered buttons */}
      {pages.map((p, idx) =>
        p === "..." ? (
          <span
            key={`ellipsis-${idx}`}
            className="w-10 h-10 grid place-items-center text-muted-foreground"
          >
            <FiMoreHorizontal />
          </span>
        ) : (
          <button
            key={p}
            aria-current={p === page ? "page" : undefined}
            className={`${baseBtn} ${p === page ? active : idle}`}
            onClick={() => onPageChange(p)}
          >
            {p}
          </button>
        )
      )}

      {/* > next & >> last (hidden on final page) */}
      {page < Math.max(1, Math.ceil(totalItems / itemsPerPage)) && (
        <>
          <button
            aria-label="Next page"
            className={iconBtn}
            onClick={() => onPageChange(page + 1)}
          >
            <FiChevronRight />
          </button>
          <button
            aria-label="Go to last page"
            className={iconBtn}
            onClick={() =>
              onPageChange(Math.max(1, Math.ceil(totalItems / itemsPerPage)))
            }
          >
            <FiChevronsRight />
          </button>
        </>
      )}
    </nav>
  );
};

export default function QuestionLayout({ questions, page }) {
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showExplanation, setShowExplanation] = useState({});

  const handleSelectAnswer = (questionId, option) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  const toggleExplanation = (questionId) => {
    setShowExplanation((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  return (
    <div className="space-y-12">
      {questions.map((q, index) => (
        <Question
          key={q._id}
          q={q}
          index={index}
          page={page}
          selectedAnswers={selectedAnswers}
          handleSelectAnswer={handleSelectAnswer}
          showExplanation={showExplanation}
          toggleExplanation={toggleExplanation}
        />
      ))}
    </div>
  );
}

export { Pagination };
