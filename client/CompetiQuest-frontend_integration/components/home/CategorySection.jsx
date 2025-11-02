// components/home/CategorySection.jsx
"use client";
import {
  motion,
  useMotionValue,
  useTransform,
  useSpring,
  AnimatePresence,
  useReducedMotion,
  useInView,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";
import Lenis from "@studio-freight/lenis";
import {
  FiBarChart2,
  FiCpu,
  FiType,
  FiGlobe,
  FiCode,
  FiZap,
  FiArrowRight,
} from "react-icons/fi";
import Link from "next/link";

// --- Enhanced Data with Key Topics for Hover Interaction ---
const categories = [
  {
    icon: <FiBarChart2 />,
    title: "Aptitude",
    description:
      "Strengthen problem-solving with topics like percentages, ratios, time & work, and more.",
    topics: ["Percentages", "Profit & Loss", "Time & Work"],
    href: "/aptitude",
  },
  {
    icon: <FiCpu />,
    title: "Logical Reasoning",
    description:
      "Improve analytical thinking through puzzles, seating arrangements, and logical series.",
    topics: ["Puzzles", "Seating Arrangement", "Coding-Decoding"],
    href: "/logical-reasoning",
  },
  {
    icon: <FiType />,
    title: "English Language",
    description:
      "Enhance grammar, vocabulary, comprehension, and communication skills.",
    topics: ["Grammar", "Vocabulary", "Comprehension"],
    href: "/english",
  },
  {
    icon: <FiGlobe />,
    title: "General Knowledge",
    description:
      "Stay updated with current affairs, history, geography, and essential facts.",
    topics: ["Current Affairs", "History", "Geography"],
    href: "/general-knowledge",
  },
  {
    icon: <FiCode />,
    title: "Programming & Tech",
    description:
      "Practice coding challenges, data structures, algorithms, and core CS concepts.",
    topics: ["Data Structures", "Algorithms", "System Design"],
    href: "/programming",
  },
  {
    icon: <FiZap />,
    title: "Mental Maths",
    description:
      "Sharpen speed and accuracy with fun and engaging mental calculation exercises.",
    topics: ["Speed Calculation", "Vedic Maths", "Puzzles"],
    href: "#",
  },
];

// --- Directional Animation Variants ---
const cardVariants = (index) => {
  const position = index % 3; // 0 for left, 1 for middle, 2 for right

  const hidden = { opacity: 0, scale: 0.9 };
  if (position === 0) {
    // Left column
    hidden.x = -80;
    hidden.rotate = -5;
  } else if (position === 1) {
    // Middle column
    hidden.y = -80;
  } else {
    // Right column
    hidden.x = 80;
    hidden.rotate = 5;
  }

  return {
    hidden,
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      rotate: 0,
      transition: { type: "spring", stiffness: 90, damping: 15, mass: 0.7 },
    },
  };
};

// --- Category Card Sub-component ---
const CategoryCard = ({ icon, title, description, topics, href, index }) => {
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: false, amount: 0.3 });
  const [isHovered, setIsHovered] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useTransform(mouseY, [-200, 200], [12, -12]);
  const rotateY = useTransform(mouseX, [-200, 200], [-12, 12]);
  const springRotateX = useSpring(rotateX, { stiffness: 400, damping: 30 });
  const springRotateY = useSpring(rotateY, { stiffness: 400, damping: 30 });

  const handleMouseMove = (e) => {
    if (!cardRef.current || shouldReduceMotion) return;
    const rect = cardRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.li
      ref={cardRef}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={shouldReduceMotion ? {} : cardVariants(index)}
    >
      <Link href={href} className="block h-full group">
        <motion.div
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
          style={{
            rotateX: shouldReduceMotion ? 0 : springRotateX,
            rotateY: shouldReduceMotion ? 0 : springRotateY,
            transformStyle: "preserve-3d",
            "--mouse-x": useTransform(mouseX, (v) => `${v}px`),
            "--mouse-y": useTransform(mouseY, (v) => `${v}px`),
          }}
          className="relative h-full bg-secondary/40 backdrop-blur-sm border border-border rounded-2xl p-8 transition-colors duration-300 hover:border-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background shadow-[0px_8px_24px_rgba(0,0,0,0.1)] dark:shadow-[0px_8px_24px_rgba(0,0,0,0.3)]"
        >
          {/* Magnetic Glow Effect (Bug-Free Version) */}
          {!shouldReduceMotion && (
            <div
              className="absolute inset-0 w-full h-full rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background:
                  "radial-gradient(300px circle at var(--mouse-x) var(--mouse-y), oklch(from var(--accent) l c h / 0.15), transparent 80%)",
              }}
            />
          )}

          {/* 3D Content Layers */}
          <div
            style={{ transform: "translateZ(40px)" }}
            className="relative z-10 h-full flex flex-col"
          >
            <motion.div
              style={{ transform: "translateZ(20px)" }}
              className="text-accent text-5xl mb-5 transition-transform duration-300 group-hover:scale-110"
            >
              {icon}
            </motion.div>
            <h3 className="text-3xl font-bold text-foreground mb-4">{title}</h3>

            <div className="relative flex-grow mb-8 min-h-[70px]">
              <AnimatePresence>
                {!isHovered && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-muted-foreground text-base"
                  >
                    {description}
                  </motion.p>
                )}
                {isHovered && (
                  <motion.ul
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2, staggerChildren: 0.05 }}
                    className="text-muted-foreground text-base space-y-1"
                  >
                    {topics.map((topic) => (
                      <motion.li
                        key={topic}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                      >
                        • {topic}
                      </motion.li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>

            <div className="mt-auto flex items-center gap-2 text-accent font-semibold opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 group-focus-visible:opacity-100 group-focus-visible:translate-y-0 transition-all duration-300">
              <span>Explore Section</span>
              <motion.span animate={{ x: isHovered ? 4 : 0 }}>
                <FiArrowRight />
              </motion.span>
            </div>
          </div>
        </motion.div>
      </Link>
    </motion.li>
  );
};

// --- Main Category Section Component ---
export default function CategorySection() {
  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.07 });
    const raf = (time) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
    return () => lenis.destroy();
  }, []);

  return (
    <section className="relative bg-background py-32 px-4">
      <div
        className="absolute inset-0 -z-10"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, oklch(from var(--foreground) l c h / 0.04) 1px, transparent 0)",
          backgroundSize: "2.5rem 2.5rem",
        }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground">
            Explore Our Core Offerings
          </h2>
          <p className="text-muted-foreground mt-4 text-lg">
            Each category includes curated questions, detailed solutions, and
            targeted practice to help you master the subject.
          </p>
        </div>

        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category, i) => (
            <CategoryCard key={category.title} {...category} index={i} />
          ))}
        </ul>
      </div>
    </section>
  );
}
