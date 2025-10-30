"use client";
import { useState } from "react";
import {
  FiSun,
  FiMoon,
  FiMenu,
  FiX,
  FiChevronDown,
  FiSearch,
  FiHome,
  FiUser,
  FiLogIn,
  FiBarChart2,
  FiCpu,
  FiType,
  FiGlobe,
  FiCode,
  FiInfo,
  FiMail,
  FiZap,
} from "react-icons/fi";
import { useTheme } from "../app/context/ThemeContext";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";

const NavLink = ({ children, href }) => (
  <Link
    href={href}
    className="text-base font-medium text-muted-foreground hover:text-foreground transition-colors duration-300 relative group"
  >
    {children}
    <span className="absolute -bottom-1 left-0 w-full h-[1.5px] bg-accent scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></span>
  </Link>
);

const CategoryDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const categories = [
    "Aptitude",
    "Logical Reasoning",
    "English",
    "General Knowledge",
    "Programming",
  ];

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button className="text-base font-medium text-muted-foreground hover:text-foreground transition-colors duration-300 relative group flex items-center gap-1 pb-1">
        <span>Category</span>
        <FiChevronDown
          size={16}
          className={`transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
        <span className="absolute -bottom-0 left-0 w-full h-[1.5px] bg-accent scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></span>
      </button>
      {isOpen && (
        <div className="absolute top-full pt-2 w-48 bg-background/95 backdrop-blur-xl border border-border rounded-lg shadow-lg py-2">
          {categories.map((cat) => (
            <Link
              key={cat}
              href={`/${cat.toLowerCase().replace(/ /g, "_")}`}
              className="block px-4 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            >
              {cat}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

const SidebarDropdown = ({ title, icon, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center py-2.5 px-4 text-left hover:bg-accent/10 hover:text-accent rounded-md transition-colors duration-200 group"
      >
        <span className="flex items-center gap-3">
          {icon}
          <span>{title}</span>
        </span>
        <FiChevronDown
          size={16}
          className={`transition-transform duration-300 text-muted-foreground group-hover:text-accent ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      {isOpen && <div className="pl-12 space-y-1 mt-1">{children}</div>}
    </div>
  );
};

const Sidebar = ({ isOpen, closeSidebar }) => {
  const categories = {
    Aptitude: {
      icon: <FiBarChart2 />,
      subItems: ["Time and Work", "Profit and Loss", "Percentages"],
    },
    Reasoning: {
      icon: <FiCpu />,
      subItems: ["Puzzles", "Seating Arrangement", "Coding-Decoding"],
    },
    English: {
      icon: <FiType />,
      subItems: ["Reading Comprehension", "Grammar", "Vocabulary"],
    },
    "General Knowledge": {
      icon: <FiGlobe />,
      subItems: ["Current Affairs", "History", "Geography"],
    },
    Programming: {
      icon: <FiCode />,
      subItems: ["Data Structures", "Algorithms", "System Design"],
    },
  };

  const formatUrl = (text) => text.toLowerCase().replace(/ /g, "_");

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/60 z-50 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeSidebar}
      />
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-background/80 backdrop-blur-xl border-r border-border/50 shadow-2xl z-50 transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-border/50 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <img
                src="/default_profile_photo.png"
                alt="Profile"
                className="w-10 h-10 rounded-full"
              />
              <div>
                <p className="font-semibold text-foreground">gauravRathod674</p>
              </div>
            </div>
            <button
              onClick={closeSidebar}
              className="p-2 rounded-full hover:bg-accent/10 hover:text-accent transition-colors duration-200"
            >
              <FiX />
            </button>
          </div>

          <div className="p-4">
            <div className="relative">
              <FiSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full bg-accent/10 border border-transparent text-foreground placeholder:text-muted-foreground rounded-md pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
          </div>

          <nav className="flex-grow px-4 space-y-1.5 overflow-y-auto">
            <Link
              href="/"
              className="flex items-center gap-3 py-2.5 px-4 hover:bg-accent/10 hover:text-accent rounded-md transition-colors duration-200"
              onClick={closeSidebar}
            >
              <FiHome /> Home
            </Link>
            <Link
              href="/profile"
              className="flex items-center gap-3 py-2.5 px-4 hover:bg-accent/10 hover:text-accent rounded-md transition-colors duration-200"
              onClick={closeSidebar}
            >
              <FiUser /> User Profile
            </Link>
            <Link
              href="/mental_maths"
              className="flex items-center gap-3 py-2.5 px-4 hover:bg-accent/10 hover:text-accent rounded-md transition-colors duration-200"
              onClick={closeSidebar}
            >
              <FiZap /> Mental Maths
            </Link>
            {Object.entries(categories).map(([title, { icon, subItems }]) => (
              <SidebarDropdown key={title} title={title} icon={icon}>
                {subItems.map((item) => (
                  <Link
                    key={item}
                    href={`/${formatUrl(title)}/${formatUrl(item)}/page1`}
                    className="block py-1.5 px-4 text-sm text-muted-foreground hover:text-accent rounded-md hover:bg-accent/10"
                    onClick={closeSidebar}
                  >
                    {item}
                  </Link>
                ))}
              </SidebarDropdown>
            ))}

            <Link
              href="/#about-us"
              className="flex items-center gap-3 py-2.5 px-4 hover:bg-accent/10 hover:text-accent rounded-md transition-colors duration-200"
              onClick={closeSidebar}
            >
              <FiInfo /> About
            </Link>
            <Link
              href="/#contact-us"
              className="flex items-center gap-3 py-2.5 px-4 hover:bg-accent/10 hover:text-accent rounded-md transition-colors duration-200"
              onClick={closeSidebar}
            >
              <FiMail /> Contact
            </Link>
          </nav>

          <div className="p-4 border-t border-border/50">
            <Link
              href="/login"
              onClick={closeSidebar}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-accent/10 hover:bg-accent text-accent hover:text-accent-foreground rounded-lg font-semibold transition-colors"
            >
              <FiLogIn />
              <span>Login</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default function Navbar() {
  const { darkMode, toggleDarkMode } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const authButton = user ? (
    <div className="hidden sm:flex items-center space-x-4">
      <Link
        href="/profile"
        className="relative p-2.5 rounded-full hover:bg-accent/10 hover:text-accent transition-colors duration-200"
      >
        <FiUser />
      </Link>
      <button
        onClick={logout}
        className="px-6 py-2 bg-red-500/20 text-red-500 font-semibold rounded-lg hover:bg-red-500 hover:text-white transition-colors duration-300"
      >
        Logout
      </button>
    </div>
  ) : (
    <Link
      href="/login"
      className="hidden sm:block px-6 py-2 bg-accent/20 text-accent font-semibold rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors duration-300"
    >
      Login
    </Link>
  );

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-40 bg-muted/10 backdrop-blur-lg border-b border-border/50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-6">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 -ml-2 text-foreground cursor-pointer"
              >
                <FiMenu size={24} />
              </button>
              <Link href="/" className="flex items-center gap-2">
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
            </div>

            <div className="hidden min-[900px]:flex items-center space-x-8">
              <NavLink href="/">Home</NavLink>
              <CategoryDropdown />
              <NavLink href="/mental_maths">Mental Maths</NavLink>
              <NavLink href="/#about-us">About</NavLink>
              <NavLink href="/#contact-us">Contact</NavLink>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={toggleDarkMode}
                className="relative p-2.5 rounded-full hover:bg-accent/10 hover:text-accent transition-colors duration-200"
              >
                <FiSun
                  className={`transition-all duration-300 transform ${
                    darkMode ? "rotate-90 scale-0" : "rotate-0 scale-100"
                  }`}
                  size={18}
                />
                <FiMoon
                  className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-300 transform ${
                    darkMode ? "rotate-0 scale-100" : "-rotate-90 scale-0"
                  }`}
                  size={18}
                />
              </button>
              {/* <Link
                href="/login"
                className="hidden sm:block px-6 py-2 bg-accent/20 text-accent font-semibold rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors duration-300"
              >
                Login
              <Link> */}
              {authButton}
            </div>
          </div>
        </nav>
      </header>
      <Sidebar
        isOpen={sidebarOpen}
        closeSidebar={() => setSidebarOpen(false)}
      />
    </>
  );
}
