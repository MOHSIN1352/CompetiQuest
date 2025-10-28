// components/home/ContactSection.jsx
"use client";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef } from "react";
import Lenis from "@studio-freight/lenis";
import { FiMapPin, FiMail, FiPhone, FiTwitter, FiLinkedin, FiInstagram, FiSend } from "react-icons/fi";

// --- Form Input Component ---
const FormInput = ({ type = "text", name, placeholder, isTextarea = false, delay }) => {
    const variants = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, delay } }
    };

    const commonProps = {
        name,
        id: name,
        placeholder,
        className: "w-full bg-secondary/40 border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-300",
        required: true,
    };

    return (
        <motion.div variants={variants}>
            {isTextarea ? (
                <textarea {...commonProps} rows="4"></textarea>
            ) : (
                <input type={type} {...commonProps} />
            )}
        </motion.div>
    );
};

// --- Main Contact Section Component ---
export default function ContactSection() {
    const sectionRef = useRef(null);
    const isInView = useInView(sectionRef, { once: true, amount: 0.2 });

    // --- Parallax Scroll Animation ---
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start end", "end start"]
    });

    const yLeft = useTransform(scrollYProgress, [0, 1], [-60, 60]);
    const yRight = useTransform(scrollYProgress, [0, 1], [60, -60]);


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
        <section id="contact-us" ref={sectionRef} className="relative bg-background py-32 px-4 overflow-hidden">
            {/* Background Gradient */}
            <div 
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150vh] -z-10"
                style={{
                background: "radial-gradient(ellipse at center, oklch(from var(--accent) l c h / 0.08), transparent 70%)"
                }}
            />

            <div className="max-w-7xl mx-auto">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-center max-w-3xl mx-auto mb-20"
                >
                    <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                        Get In Touch
                    </h2>
                    <p className="text-muted-foreground text-lg">
                        Have a question or a proposal? We'd love to hear from you.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                    {/* Left Column: Contact Info */}
                    <motion.div 
                        style={{ y: yLeft }}
                        initial="hidden"
                        animate={isInView ? "visible" : "hidden"}
                        variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
                        className="space-y-8"
                    >
                        <motion.div variants={{ hidden: { opacity: 0, x: -30 }, visible: { opacity: 1, x: 0 } }} className="flex items-start gap-4">
                            <FiMapPin className="text-accent text-3xl mt-1" />
                            <div>
                                <h3 className="text-xl font-semibold text-foreground">Our Office</h3>
                                <p className="text-muted-foreground">123 Innovation Drive, Tech Park, Ahmedabad, Gujarat, 380015</p>
                            </div>
                        </motion.div>
                        <motion.div variants={{ hidden: { opacity: 0, x: -30 }, visible: { opacity: 1, x: 0 } }} className="flex items-start gap-4">
                            <FiMail className="text-accent text-3xl mt-1" />
                            <div>
                                <h3 className="text-xl font-semibold text-foreground">Email Us</h3>
                                <p className="text-muted-foreground">support@competiquest.com</p>
                            </div>
                        </motion.div>
                         <motion.div variants={{ hidden: { opacity: 0, x: -30 }, visible: { opacity: 1, x: 0 } }} className="flex items-start gap-4">
                            <FiPhone className="text-accent text-3xl mt-1" />
                            <div>
                                <h3 className="text-xl font-semibold text-foreground">Call Us</h3>
                                <p className="text-muted-foreground">+91 98765 43210</p>
                            </div>
                        </motion.div>
                        <motion.div variants={{ hidden: { opacity: 0, x: -30 }, visible: { opacity: 1, x: 0 } }} className="pt-4">
                             <h3 className="text-xl font-semibold text-foreground mb-4">Follow Us</h3>
                             <div className="flex space-x-4">
                                <motion.a href="#" whileHover={{ scale: 1.2, color: 'var(--accent)' }} className="text-muted-foreground text-2xl"><FiTwitter /></motion.a>
                                <motion.a href="#" whileHover={{ scale: 1.2, color: 'var(--accent)' }} className="text-muted-foreground text-2xl"><FiLinkedin /></motion.a>
                                <motion.a href="#" whileHover={{ scale: 1.2, color: 'var(--accent)' }} className="text-muted-foreground text-2xl"><FiInstagram /></motion.a>
                             </div>
                        </motion.div>
                    </motion.div>

                    {/* Right Column: Contact Form */}
                    <motion.form 
                        style={{ y: yRight }}
                        initial="hidden"
                        animate={isInView ? "visible" : "hidden"}
                        variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
                        className="space-y-6"
                    >
                        <FormInput name="name" placeholder="Your Name" delay={0.1} />
                        <FormInput type="email" name="email" placeholder="Your Email" delay={0.2} />
                        <FormInput name="subject" placeholder="Subject" delay={0.3} />
                        <FormInput name="message" placeholder="Your Message" isTextarea={true} delay={0.4} />
                        <motion.div variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, delay: 0.5 } } }}>
                            <motion.button 
                                type="submit"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-accent text-accent-foreground font-bold rounded-lg shadow-lg"
                            >
                                <FiSend />
                                <span>Send Message</span>
                            </motion.button>
                        </motion.div>
                    </motion.form>
                </div>
            </div>
        </section>
    );
}
