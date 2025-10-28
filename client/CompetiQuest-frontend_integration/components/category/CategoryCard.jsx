"use client";

import axios from "axios";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

// Helper function to format the title for the URL
const formatTitleForUrl = (title) => {
  // Replaces one or more spaces with an underscore and converts to lowercase
  return title.replace(/\s+/g, "_").toLowerCase();
};

export default function CategoryCard({
  title,
  chapters,
  items,
  progress,
  gradient,
}) {
  const radius = 35;
  const strokeDasharray = 2 * Math.PI * radius;
  const strokeDashoffset = strokeDasharray * (1 - progress);
  const progressPercentage = Math.round(progress * 100);
  const router = useRouter();
  const pathname = usePathname(); // gets current path, e.g., /aptitude

  // Handles the navigation to the specific category item page
  const handleClick = () => {
    // Format the title to be URL-friendly (e.g., "Time and Work" -> "time_and_work")
    const formattedTitle = formatTitleForUrl(title);
    // Push the new route to the router
    router.push(`${pathname}/${formattedTitle}/page1`);
  };
  useEffect(() => {
    const fetchData = async () => {
      const response = await axios("http://localhost:5000/api/categories");
      if (response) console.log("this is category data: ", response);
    };
    fetchData();
  }, []);
  return (
    <div className="relative w-full max-w-sm h-80 flex flex-col overflow-hidden rounded-3xl shadow-xl shadow-accent/10 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
      {/* Background with gradient and subtle rings */}
      <div
        className={`relative flex-grow-4 w-full bg-gradient-to-br ${gradient}/50 p-4`}
      >
        {/* Title text */}
        <h3 className="absolute top-4 left-4 text-white text-3xl font-bold leading-tight z-10">
          {title}
        </h3>
        <div className="absolute top-30 w-fit  opacity-10 pointer-events-none">
          {/* Subtle rings for a dynamic effect */}
          <div className="absolute h-48 w-48 rounded-full border-8 border-white border-opacity-20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin-slow"></div>
          <div className="absolute h-36 w-36 rounded-full border-8 border-white border-opacity-20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin-slow-reverse"></div>
        </div>
        {/* Progress circle SVG */}
        <div
          className="absolute -bottom-10 right-4 z-10 "
          onClick={handleClick} // Updated onClick handler
        >
          <PlayButton
            progressPercentage={progressPercentage}
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
          />
        </div>
      </div>

      {/* Card stats section */}
      <div className="relative  flex items-center justify-between bg-primary p-6 rounded-b-3xl ">
        <div className="flex justify-start items-center gap-4">
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold text-muted-foreground">
              {chapters}
            </span>
            <span className="text-xs text-gray-500">Chapters</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold text-muted-foreground">
              {items}
            </span>
            <span className="text-xs text-gray-500">Items</span>
          </div>
        </div>
        <div className="mt-5 absolute right-12">
          <span className="text-md font-semibold text-muted-foreground/50">
            {progressPercentage}%
          </span>
        </div>
      </div>
    </div>
  );
}

const PlayButton = ({
  progressPercentage,
  strokeDasharray,
  strokeDashoffset,
}) => {
  return (
    <div className="relative h-24 w-24">
      {/* SVG with updated viewBox and size */}
      <svg viewBox="0 0 80 80" className="h-full w-full transform -rotate-90">
        {/* Background circle */}
        <circle
          className="text-gray-300 "
          strokeWidth="6"
          stroke="currentColor"
          fill="transparent"
          r="35"
          cx="40"
          cy="40"
        />
        {/* Progress arc */}
        <circle
          className="text-green-500 transition-all duration-700 ease-in-out"
          strokeWidth="6"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r="35"
          cx="40"
          cy="40"
        />
      </svg>

      {/* Centered Play Button */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center h-20 w-20 bg-primary rounded-full shadow-lg cursor-pointer transition-all duration-300 hover:scale-110">
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-10 h-10 text-primary-foreground"
        >
          <path d="M8 5v14l11-7z" />
        </svg>
      </div>
    </div>
  );
};
