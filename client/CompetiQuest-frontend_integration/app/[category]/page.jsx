"use client";

import React, { useEffect, useState } from "react";
import { FiClock } from "react-icons/fi";
import Squares from "@/components/home/Squares";
import CategoryCard from "@/components/category/CategoryCard";
import axios from "axios";

const gradients = [
  "from-purple-500 to-pink-500",
  "from-blue-500 to-teal-500",
  "from-green-400 to-yellow-400",
  "from-red-500 to-orange-500",
];

export default function CategoryPage() {
  const [topics, setTopics] = useState([]);
  const [category, setCategory] = useState(null); // Store category object here
  const [loading, setLoading] = useState(true);

  // Fetch topics for a category
  const fetchTopics = async (categoryId) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/topics/${categoryId}`
      );
      if (response.data) setTopics(response.data);
    } catch (error) {
      console.error("Error fetching topics:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Get the stored category object
    const storedCat = sessionStorage.getItem("selectedCategory");

    if (storedCat) {
      try {
        const parsedCat = JSON.parse(storedCat);
        setCategory(parsedCat);
        fetchTopics(parsedCat._id);
      } catch (err) {
        console.error("Error parsing stored category:", err);
      }
    } else {
      console.warn("No category found in sessionStorage");
      setLoading(false);
    }
  }, []);
  // console.log(topics);
  return (
    <div className="min-h-screen bg-background text-foreground pt-20">
      {/* Header */}
      <header className="relative h-45 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0 [mask-image:radial-gradient(ellipse_120%_90%_at_center,black_40%,transparent_90%)]">
          <Squares
            speed={0.1}
            squareSize={30}
            direction="diagonal"
            borderColor="oklch(0.66 0.015 65 / 0.15)"
            hoverFillColor="#bb5052"
          />
        </div>

        <div className="relative z-10 flex items-center justify-center gap-5 sm:gap-10">
          <FiClock className="text-[#bb5052] text-[2rem] sm:text-[5rem]" />
          <div className="flex flex-col items-start">
            <h1 className="text-xl sm:text-6xl font-extrabold text-foreground">
              {category?.name
                ? category.name.charAt(0).toUpperCase() +
                  category.name.slice(1).replace(/_/g, " ")
                : "Loading..."}
            </h1>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-15 bg-gradient-to-b from-background/0 to-background z-20 pointer-events-none" />
      </header>

      {/* Main */}
      <main className="max-w-4xl mx-auto p-4 md:p-8">
        {loading ? (
          <p className="text-zinc-500">Loading topics...</p>
        ) : topics.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {topics.map((topic, index) => (
              <CategoryCard
                key={topic._id || index}
                data={topic}
                title={topic.name}
                chapters={topic.chapters}
                items={topic.items}
                progress={topic.progress}
                gradient={gradients[index % gradients.length]}
              />
            ))}
          </div>
        ) : (
          <p className="text-zinc-500">
            No topics found for {category?.name || "this category"}.
          </p>
        )}
      </main>
    </div>
  );
}
