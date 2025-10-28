"use client";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { useEffect, useRef } from "react";
import Lenis from "@studio-freight/lenis";
import {
  FiBarChart2, FiCpu, FiType, FiGlobe, FiCode,
  FiZap, FiSmartphone, FiRefreshCcw
} from "react-icons/fi";

const features = [
  { icon: <FiBarChart2 />, title: "Extensive Question Bank", text: "Master Aptitude, Reasoning, English, GK, and more." },
  { icon: <FiZap />, title: "AI Chatbot Tutor", text: "Instant answers and topic explanations powered by AI." },
  { icon: <FiCpu />, title: "Progress Tracking", text: "Monitor your strengths and weaknesses in each section." },
  { icon: <FiType />, title: "Mental Maths", text: "Boost your calculation speed with interactive challenges." },
  { icon: <FiGlobe />, title: "Modern UI & Dark Mode", text: "Study in style with a sleek, responsive interface." },
  { icon: <FiRefreshCcw />, title: "Regular Updates", text: "Fresh content added to keep you ahead." },
  { icon: <FiSmartphone />, title: "Learn Anywhere", text: "Fully responsive across all devices." },
  { icon: <FiCode />, title: "Interactive Practice", text: "Engage with dynamic, hands-on problem solving." },
];

// --- Animation Variants ---
const cardVariants = (isLeft) => ({
  hidden: { opacity: 0, x: isLeft ? -150 : 150, scale: 0.8, rotate: 5 },
  visible: { 
    opacity: 1, 
    x: 0, 
    scale: 1,
    rotate: 0,
    transition: { type: "spring", stiffness: 80, damping: 15, mass: 1 }
  },
});

const dotVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: { 
    scale: 1, 
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 20 }
  }
};

// --- Timeline Item Component ---
const TimelineItem = ({ feature, isLeft }) => {
  const itemRef = useRef(null);
  const isInView = useInView(itemRef, { amount: 0.4 }); // Re-triggers animation

  // Parallax effect for the icon
  const { scrollYProgress } = useScroll({
    target: itemRef,
    offset: ["start end", "end start"]
  });
  const y = useTransform(scrollYProgress, [0, 1], [-30, 30]);

  // Define the new, multi-layered shadow for the hover state
  const hoverShadow = [
    // A subtle inner highlight to create a "glass edge" effect
    "inset 0 1px 1px oklch(from var(--foreground) l c h / 0.1)",
    // A soft, colored primary shadow for depth
    "0px 10px 20px -5px oklch(from var(--accent) l c h / 0.2)",
    // A vibrant, surrounding glow for that "wow factor"
    "0px 0px 25px -5px oklch(from var(--accent) l c h / 0.3)"
  ].join(", ");

  return (
    <div ref={itemRef} className={`mb-12 flex items-center w-full relative ${isLeft ? "justify-start" : "justify-end"}`}>
      <motion.div 
        variants={dotVariants}
        animate={isInView ? "visible" : "hidden"}
        className={`absolute left-1/2 -translate-x-1/2 w-3 h-3 bg-background rounded-full border-2 border-accent z-10`}
      >
        <motion.div 
            animate={{ scale: isInView ? [1, 1.8, 1] : 0, opacity: isInView ? [0, 1, 0] : 0 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-full h-full bg-accent rounded-full"
        />
      </motion.div>
      
      <motion.div
        variants={cardVariants(isLeft)}
        animate={isInView ? "visible" : "hidden"}
        whileHover={{ scale: 1.05, boxShadow: hoverShadow }}
        transition={{ type: "spring", stiffness: 300, damping: 10 }}
        className={`bg-accent/5 backdrop-blur-sm border border-accent/10 rounded-2xl shadow-lg p-6 w-[calc(50%-3rem)]`}
      >
        <motion.div style={{ y }} className="text-accent text-3xl mb-3">{feature.icon}</motion.div>
        <h3 className="text-xl font-semibold mb-2 text-accent">{feature.title}</h3>
        <p className="text-muted-foreground text-sm">{feature.text}</p>
      </motion.div>
    </div>
  );
};
// --- Main Features Timeline Component ---
export default function FeaturesTimeline() {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start center", "end end"],
  });
  const timelineHeight = useTransform(scrollYProgress, [0, 1], [0, 1]);

  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.07 });
    const raf = (time) => { lenis.raf(time); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    return () => lenis.destroy();
  }, []);

  return (
    <section ref={sectionRef} className="relative bg-background py-24 px-4 overflow-hidden">
      <div 
        className="absolute inset-0 -z-10"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, oklch(from var(--foreground) l c h / 0.05) 1px, transparent 0)",
          backgroundSize: "2rem 2rem"
        }}
      />
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[200%] h-[100vh] -z-0"
        style={{
          background: "radial-gradient(ellipse at top, oklch(from var(--accent) l c h / 0.1), transparent 60%)"
        }}
      />
      
      <div className="max-w-4xl mx-auto relative z-10">
        {/* Heading Section */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground">A Journey Through Our Features</h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
            Discover the powerful tools designed to help you succeed, step by step.
          </p>
        </div>

        {/* --- FIX: New container for the timeline --- */}
        <div className="relative">
          {/* Animated Center Line is now contained correctly */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-full bg-accent/20 origin-top">
              <motion.div 
                className="w-full h-full bg-accent origin-top"
                style={{ scaleY: timelineHeight }}
              />
          </div>

          {/* Feature items */}
          <div>
            {features.map((feature, i) => (
              <TimelineItem key={feature.title} feature={feature} isLeft={i % 2 === 0} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}