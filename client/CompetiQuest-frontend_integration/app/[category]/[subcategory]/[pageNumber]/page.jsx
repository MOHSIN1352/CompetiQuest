"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { FiClock } from "react-icons/fi";
import Squares from "../../../../components/home/Squares";
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

  // const category = params.category;
  // const subcategory = decodeURIComponent(params.subcategory || "");
  const pageNumber = parseInt(params.pageNumber.replace("page", ""), 10) || 1;

  const [questions, setQuestions] = useState([]);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [loading, setLoading] = useState(true);
  const [themeColors, setThemeColors] = useState({
    border: "oklch(0.15 0 0 / 0.1)",
    hover: "#222",
  });
  const [subcategory, setSubcategory] = useState([]);

  const questionsPerPage = 10; // fetch 10 per page
  // const slugSub = subcategory.replace(/ /g, "-");

  const fetchQuestions = async (subcategory) => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/questions/${subcategory}`,
        {
          params: {
            page: pageNumber,
            limit: questionsPerPage,
          },
          withCredentials: true, // if you use cookies for auth
        }
      );

      // Expecting { questions: [], totalQuestions: number }
      setQuestions(res.data.questions || []);
      setTotalQuestions(res.data.totalQuestions || 0);
    } catch (error) {
      console.error("Error fetching questions:", error);
      setQuestions([]);
      setTotalQuestions(0);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    // Get the stored category object
    const storedSubCat = sessionStorage.getItem("selectedSubCategory");
    // console.log("this is topic id: ", storedSubCat);
    if (storedSubCat) {
      try {
        const parsedSubCat = JSON.parse(storedSubCat);
        setSubcategory(parsedSubCat);
        fetchQuestions(parsedSubCat._id);
      } catch (err) {
        console.error("Error parsing stored category:", err);
      }
    } else {
      console.warn("No category found in sessionStorage");
      setLoading(false);
    }
  }, []);

  // // ✅ Fetch questions from API
  // useEffect(() => {
  //   if (subcategory) fetchQuestions();
  // }, [subcategory, pageNumber]);

  useEffect(() => {
    const get = (v) =>
      getComputedStyle(document.documentElement).getPropertyValue(v).trim();
    const fg = get("--color-foreground");
    const border = fg.replace(")", " / 0.1)");
    setThemeColors({ border, hover: fg });
  }, []);

  const handlePageChange = (newPage) => {
    router.push(`/${category}/${slugSub}/page${newPage}`);
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
        </div>

        <div className="relative z-10 flex items-center justify-center gap-10">
          <FiClock className="text-[#bb5052] text-[8rem] md:text-[10rem]" />
          <div className="flex flex-col items-start">
            <h1 className="text-5xl md:text-6xl font-extrabold text-foreground">
              {formatText(subcategory.name)}
            </h1>

            {/* Progress Section */}
            <div className="mt-6 w-full">
              <div className="flex items-center gap-3">
                {/* Progress bar */}
                <div className="flex-1 max-w-sm h-2 rounded-full bg-border overflow-hidden">
                  <div
                    className="h-full bg-[#bb5052] transition-all"
                    style={{
                      width: `${Math.min(
                        (((pageNumber - 1) * questionsPerPage +
                          questions.length) /
                          totalQuestions) *
                          100 || 0,
                        100
                      )}%`,
                    }}
                  />
                </div>

                {/* Progress count */}
                <div className="flex items-center gap-1 text-lg font-medium text-foreground">
                  <span>
                    {(pageNumber - 1) * questionsPerPage + questions.length} /{" "}
                    {totalQuestions}
                  </span>
                  <FiClock className="ml-1 text-accent" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Questions + Pagination */}
      <main className="max-w-4xl mx-auto p-4 md:p-8">
        {loading ? (
          <p className="text-gray-400 text-center">Loading questions...</p>
        ) : questions.length > 0 ? (
          <>
            <QuestionLayout questions={questions} page={pageNumber} />
            <Pagination
              page={pageNumber}
              totalItems={totalQuestions}
              itemsPerPage={questionsPerPage}
              onPageChange={handlePageChange}
            />
          </>
        ) : (
          <p className="text-gray-400 text-center">
            No questions found for this topic.
          </p>
        )}
      </main>
    </div>
  );
}
