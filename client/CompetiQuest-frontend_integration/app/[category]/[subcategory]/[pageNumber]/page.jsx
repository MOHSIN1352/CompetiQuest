// app/[category]/[subcategory]/[pageNumber]/page.jsx
"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FiClock } from "react-icons/fi";
import Squares from "../../../../components/home/Squares";
import { allQuestions } from "../../../../lib/data";
import QuestionLayout, {
  Pagination,
} from "../../../../components/qna/QuestionLayout";

const formatText = (text) =>
  (text || "")
    .replace(/[-_]/g, " ")
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

export default function QuestionPage() {
  const params = useParams();
  const router = useRouter();

  const category = params.category;
  const subcategory = decodeURIComponent(params.subcategory || "");
  const pageNumber = parseInt(params.pageNumber, 10) || 1;

  const [themeColors, setThemeColors] = useState({
    border: "oklch(0.15 0 0 / 0.1)",
    hover: "#222",
  });

  const questionsPerPage = 5;
  const slugSub = subcategory.replace(/ /g, "-");
  const questions = allQuestions[category]?.[slugSub] || [];
  const totalQuestions = questions.length;

  const startIdx = (pageNumber - 1) * questionsPerPage;
  const paginatedQuestions = questions.slice(
    startIdx,
    startIdx + questionsPerPage
  );

  useEffect(() => {
    const get = (v) =>
      getComputedStyle(document.documentElement).getPropertyValue(v).trim();
    const fg = get("--color-foreground");
    const border = fg.replace(")", " / 0.1)");
    setThemeColors({ border, hover: fg });
  }, []);

  const handlePageChange = (newPage) => {
    router.push(`/${category}/${slugSub}/${newPage}`);
  };

  return (
    <div className="min-h-screen bg-background text-foreground pt-20">
      {/* Topic Header */}
      <header className="relative h-55 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0 [mask-image:radial-gradient(ellipse_120%_90%_at_center,black_40%,transparent_90%)]">
          <Squares
            speed={0.1}
            squareSize={30}
            direction="diagonal"
            borderColor="oklch(0.66 0.015 65 / 0.15)"
            hoverFillColor="#bb5052"
          />
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
          radial-gradient(ellipse at center, var(--accent-glow) 0%, transparent 50%),
          radial-gradient(ellipse at center, oklch(from var(--accent) l c h / 0.1) 0%, transparent 80%)
        `,
            }}
          />
        </div>

        {/* Content Row: Icon (left) + Title/Progress (right) */}
        <div className="relative z-10 flex items-center justify-center gap-10">
          {/* Left: Huge Icon */}
          <FiClock
            className="text-[#bb5052] text-[8rem] md:text-[10rem] 
                 drop-shadow-[0_0_40px_var(--accent-glow)] flex-shrink-0"
          />

          {/* Right: Title + Category + Progress */}
          <div className="flex flex-col items-start">
            {/* Category */}
            {/* <p
              className="mt-1 text-[#bb5052] text-xl font-bold uppercase tracking-widest 
                   drop-shadow-[0_0_15px_var(--accent-glow)]"
            >
              {formatText(category)}
            </p> */}

            {/* Subcategory */}
            <h1
              className="text-5xl md:text-6xl font-extrabold text-foreground 
                   drop-shadow-[0_0_25px_var(--accent-glow)]"
            >
              {formatText(subcategory)}
            </h1>


            {/* Progress Section */}
            <div className="mt-6 w-full">
              <div className="flex items-center gap-3">
                {/* Progress bar */}
                <div
                  className="flex-1 max-w-sm h-2 rounded-full bg-border overflow-hidden 
                          drop-shadow-[0_0_12px_var(--accent-glow)]"
                >
                  <div
                    className="h-full bg-[#bb5052] transition-all"
                    style={{
                      width: `${Math.min(
                        (((pageNumber - 1) * questionsPerPage +
                          paginatedQuestions.length) /
                          totalQuestions) *
                          100,
                        100
                      )}%`,
                    }}
                  />
                </div>

                {/* Progress count */}
                <div
                  className="flex items-center gap-1 text-lg font-medium text-foreground 
                       drop-shadow-[0_0_12px_var(--accent-glow)]"
                >
                  <span>
                    {(pageNumber - 1) * questionsPerPage +
                      paginatedQuestions.length}{" "}
                    / {totalQuestions}
                  </span>
                  <FiClock className="ml-1 text-accent drop-shadow-[0_0_10px_var(--accent-glow)]" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ⬇ Fade Mask for Blend */}
        <div className="absolute bottom-0 left-0 right-0 h-15 bg-gradient-to-b from-background/0 to-background z-20 pointer-events-none" />
      </header>

      {/* Questions + Pagination */}
      <main className="max-w-4xl mx-auto p-4 md:p-8">
        <QuestionLayout questions={paginatedQuestions} page={pageNumber} />

        <Pagination
          page={pageNumber}
          totalItems={totalQuestions}
          itemsPerPage={questionsPerPage}
          onPageChange={handlePageChange}
        />
      </main>
    </div>
  );
}
