"use client";
import { useTheme } from "../app/context/ThemeContext";
import Image from "next/image";
import {
  FiSend,
  FiTwitter,
  FiInstagram,
  FiLinkedin,
  FiHome,
  FiInfo,
  FiMail,
  FiCpu,
  FiBarChart2,
  FiType,
  FiGlobe,
  FiCode,
  FiZap,
} from "react-icons/fi";
import Link from "next/link";

const FooterLink = ({ icon, text, href }) => (
  <li>
    <Link
      href={href}
      className="flex items-center gap-3 hover:text-accent transition-colors"
    >
      {icon}
      <span>{text}</span>
    </Link>
  </li>
);

export default function Footer() {
  const { darkMode } = useTheme();

  const quickLinks = [
    { text: "Home", icon: <FiHome size={16} />, href: "/" },
    { text: "About", icon: <FiInfo size={16} />, href: "/#about-us" },
    { text: "Contact", icon: <FiMail size={16} />, href: "/#contact-us" },
    { text: "Mental Maths", icon: <FiZap size={16} />, href: "/mental_maths" },
  ];
  const categories = [
    { text: "Aptitude", icon: <FiBarChart2 size={16} />, href: "/aptitude" },
    { text: "Reasoning", icon: <FiCpu size={16} />, href: "/reasoning" },
    { text: "English", icon: <FiType size={16} />, href: "/english" },
    { text: "General Knowledge", icon: <FiGlobe size={16} />, href: "/general_knowledge" },
    { text: "Programming", icon: <FiCode size={16} />, href: "/programming" },
  ];

  return (
    <footer className="bg-secondary/35 text-muted-foreground border-t border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Branding & About */}
          <div className="md:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Image
                src={darkMode ? "/Dark_Logo.png" : "/Light_Logo.png"}
                alt="Logo"
                width={35}
                height={35}
              />
              <span className="text-2xl font-bold">
                <span className="text-foreground">Competi</span>
                <span className="text-accent">Quest</span>
              </span>
            </Link>
            <p className="text-sm max-w-xs">
              Your one-stop destination for AI-powered competitive exam
              preparation.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <FooterLink key={link.text} {...link} />
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Categories</h4>
            <ul className="space-y-3">
              {categories.map((cat) => (
                <FooterLink key={cat.text} {...cat} />
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Stay Updated</h4>
            <p className="text-sm mb-3">
              Subscribe to our newsletter for the latest updates and tips.
            </p>
            <form className="flex" suppressHydrationWarning={true}>
              <input
                suppressHydrationWarning
                type="email"
                placeholder="Enter your email"
                className="w-full bg-background border border-border/70 rounded-l-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <button
                type="submit"
                className="bg-accent text-accent-foreground p-2.5 rounded-r-md hover:bg-accent/90 transition-colors"
              >
                <FiSend />
              </button>
            </form>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border/50 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm">
            © {new Date().getFullYear()} CompetiQuest. All rights reserved.
          </p>
          <div className="flex space-x-4 mt-4 sm:mt-0">
            <Link href="#" className="hover:text-accent transition-colors">
              <FiTwitter />
            </Link>
            <Link href="#" className="hover:text-accent transition-colors">
              <FiInstagram />
            </Link>
            <Link href="#" className="hover:text-accent transition-colors">
              <FiLinkedin />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
