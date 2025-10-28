// components/home/ImpactSection.jsx
"use client";
import { motion, useInView, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef } from "react";
import Lenis from "@studio-freight/lenis";
import { FiTrendingUp, FiUsers, FiCheckCircle } from "react-icons/fi";

// --- Animated Counter Component ---
const AnimatedCounter = ({ value, icon, title, suffix = "" }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.5 });
    
    // 1. Initialize the spring at 0.
    const spring = useSpring(0, {
        mass: 0.8,
        stiffness: 100,
        damping: 15,
    });

    // 2. Use useEffect to imperatively update the spring's value when it comes into view.
    useEffect(() => {
        if (isInView) {
            spring.set(value);
        }
    }, [isInView, value, spring]);


    // 3. The rest of the logic remains the same.
    const displayValue = useTransform(spring, (current) => Math.round(current).toLocaleString());

    return (
        <motion.div 
            ref={ref}
            className="flex flex-col items-center text-center p-8 bg-secondary/40 backdrop-blur-sm border border-border rounded-2xl shadow-[0px_8px_24px_rgba(0,0,0,0.1)] dark:shadow-[0px_8px_24px_rgba(0,0,0,0.3)]"
        >
            <div className="text-accent text-5xl mb-4">{icon}</div>
            <h3 className="text-5xl md:text-6xl font-bold text-foreground">
                <motion.span>{displayValue}</motion.span>
                {suffix}
            </h3>
            <p className="text-muted-foreground mt-2">{title}</p>
        </motion.div>
    );
};

// --- Main Impact Section Component ---
export default function ImpactSection() {
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

    const impactStats = [
        { value: 5000, suffix: "+", title: "Questions with Solutions", icon: <FiCheckCircle /> },
        { value: 1000, suffix: "+", title: "Active Learners", icon: <FiUsers /> },
        { value: 90, suffix: "%", title: "Improved Performance", icon: <FiTrendingUp /> },
    ];

    return (
        <section ref={sectionRef} className="relative bg-background py-32 px-4">
             <div 
                className="absolute inset-0 -z-10"
                style={{
                backgroundImage: "radial-gradient(circle at 1px 1px, oklch(from var(--foreground) l c h / 0.04) 1px, transparent 0)",
                backgroundSize: "2.5rem 2.5rem"
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
                        Our Impact in Numbers
                    </h2>
                    <p className="text-muted-foreground text-lg">
                        We're proud of the community we've built and the progress our learners have made.
                    </p>
                </motion.div>

                <motion.div 
                    initial="hidden"
                    animate={isInView ? "visible" : "hidden"}
                    variants={{
                        visible: { transition: { staggerChildren: 0.2 } }
                    }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-8"
                >
                    {impactStats.map((stat, index) => (
                         <motion.div
                            key={index}
                            variants={{
                                hidden: { opacity: 0, y: 50 },
                                visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
                            }}
                         >
                            <AnimatedCounter {...stat} />
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}