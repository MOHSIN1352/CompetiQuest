"use client";
import React from "react";
import { useParams } from 'next/navigation'; // Import the useParams hook
import { FiClock } from "react-icons/fi";
import Squares from "@/components/home/Squares";
import CategoryCard from "@/components/category/CategoryCard";
import { cardData } from "@/lib/data";

const gradients = [
  "from-purple-500 to-pink-500",
  "from-blue-500 to-teal-500",
  "from-green-400 to-yellow-400",
  "from-red-500 to-orange-500",
];

const categories = [
  "Aptitude",
  "Reasoning",
  "English",
  "General Knowledge",
  "Programming",
];

export default function Category() { // Removed {params} from here
  const params = useParams(); // Get params using the hook
  const totalQuestions = 20;
  const { category } = params; // Destructure category from params
  const courses = cardData[category] || [];
  const pageNumber = 1;
  const questionsPerPage = 5;
  const paginatedQuestions = Array(5).fill({});
  return (
    <div className="min-h-screen bg-background text-foreground pt-20">
      {/* Topic Header */}
      <header className="relative h-45 flex items-center justify-center overflow-hidden ">
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
          radial-gradient(ellipse at center, oklch(from var(--accent) l c h / 0.1) 0%, transparent 80%)`,
            }}
          />
        </div>

        <div className="relative z-10 flex items-center justify-center gap-5 sm:gap-10">
          <FiClock
            className="text-[#bb5052] text-[2rem] sm:text-[5rem] 
              drop-shadow-[0_0_40px_var(--accent-glow)] flex-shrink-0"
          />

          <div className="flex flex-col items-start">
            <h1
              className="text-xl sm:text-6xl font-extrabold text-foreground 
                drop-shadow-[0_0_25px_var(--accent-glow)]"
            >
              {typeof category === 'string'
                ? category.charAt(0).toUpperCase() +
                  category.slice(1).replace(/_/g, " ")
                : ''}
            </h1>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-15 bg-gradient-to-b from-background/0 to-background z-20 pointer-events-none" />
      </header>
      <main className=" max-w-4xl mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((card, index) => (
            <CategoryCard
              key={index}
              title={card.title}
              chapters={card.chapters}
              items={card.items}
              progress={card.progress}
              gradient={gradients[index % gradients.length]}
            />
          ))}
          {courses.length === 0 && (
            <p className="text-zinc-500">No courses found for "{category}"</p>
          )}
        </div>
      </main>
    </div>
  );
}