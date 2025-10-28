// components/home/AboutUsSection.jsx
"use client";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { useEffect, useRef } from "react";
import Lenis from "@studio-freight/lenis";
import { FiTarget, FiEye, FiZap } from "react-icons/fi";
import Link from "next/link";

// --- Data for the Core Values ---
const coreValues = [
  {
    icon: <FiTarget />,
    title: "Our Mission",
    description:
      "To democratize competitive exam preparation by providing an intelligent, accessible, and highly effective AI-powered platform for every aspiring learner.",
  },
  {
    icon: <FiEye />,
    title: "Our Vision",
    description:
      "To become the most trusted and personalized learning companion, helping millions achieve their career goals through technology and data-driven insights.",
  },
  {
    icon: <FiZap />,
    title: "Our Approach",
    description:
      "We combine cutting-edge AI with proven pedagogical methods. Our focus is on interactive practice, instant feedback, and creating adaptive learning paths.",
  },
];

// --- Core Value Card Sub-component with 3D Scroll Animation ---
const ValueCard = ({ value, index }) => {
  const cardRef = useRef(null);

  // useScroll hook to track scroll progress relative to the card
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "end start"],
  });

  // --- FIXED DYNAMIC 3D ANIMATIONS ---
  // The "else" conditions now return [0, 0, 0] to match the input range's length of 3.
  const rotateY = useTransform(scrollYProgress, [0, 0.5, 1], index === 0 ? [-25, 0, 10] : index === 2 ? [25, 0, -10] : [0, 0, 0]);
  const rotateX = useTransform(scrollYProgress, [0, 0.5, 1], index === 1 ? [25, 0, -10] : [0, 0, 0]);
  
  // Scale cards up as they enter the center of the viewport
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 0.8]);
  // Fade cards in and out at the edges of the viewport
  const opacity = useTransform(scrollYProgress, [0, 0.25, 0.75, 1], [0, 1, 1, 0]);

  const hoverShadow = [
    "inset 0 1px 1px oklch(from var(--foreground) l c h / 0.1)",
    "0px 10px 20px -5px oklch(from var(--accent) l c h / 0.2)",
    "0px 0px 25px -5px oklch(from var(--accent) l c h / 0.3)"
  ].join(", ");

  return (
    <motion.div
      ref={cardRef}
      style={{
        rotateY,
        rotateX,
        scale,
        opacity,
        transformStyle: "preserve-d",
      }}
      whileHover={{ boxShadow: hoverShadow }}
      transition={{ type: "spring", stiffness: 300, damping: 15 }}
      className="bg-accent/5 backdrop-blur-sm border border-accent/10 rounded-2xl shadow-lg p-8 text-center flex flex-col items-center"
    >
      {/* Push content forward in 3D space */}
      <div style={{ transform: "translateZ(50px)" }} className="flex flex-col items-center text-center">
        <div className="text-accent text-5xl mb-6 p-4 bg-accent/10 rounded-full">
          {value.icon}
        </div>
        <h3 className="text-2xl font-bold text-accent mb-4">
          {value.title}
        </h3>
        <p className="text-muted-foreground text-base leading-relaxed">
          {value.description}
        </p>
      </div>
    </motion.div>
  );
};


// --- Main About Us Section Component ---
export default function AboutUsSection() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });

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
    <section id="about-us" ref={sectionRef} className="relative bg-background py-32 px-4 overflow-hidden">
        <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150vh] -z-10"
            style={{
            background: "radial-gradient(ellipse at center, oklch(from var(--accent) l c h / 0.08), transparent 70%)"
            }}
        />

      <div className="max-w-7xl mx-auto">
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            The Philosophy Behind Our Platform
          </h2>
          <p className="text-muted-foreground text-lg">
            We're more than just a question bank. We are a dedicated team driven by a core set of values aimed at revolutionizing how you prepare for success.
          </p>
        </motion.div>

        {/* Add perspective to the parent container for 3D effect */}
        <div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          style={{ perspective: "1200px" }}
        >
          {coreValues.map((value, index) => (
            <ValueCard
              key={value.title}
              value={value}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}