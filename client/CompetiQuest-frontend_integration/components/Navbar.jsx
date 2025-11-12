"use client";
import { useEffect, useState } from "react";
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
  FiHelpCircle,
} from "react-icons/fi";
import { useTheme } from "../app/context/ThemeContext";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";
import axios from "axios";
import { useRouter } from "next/navigation";

const NavLink = ({ children, href }) => (
  <a
    href={href}
    className="text-base font-medium text-muted-foreground hover:text-foreground transition-colors duration-300 relative group"
  >
    {children}
    <span className="absolute -bottom-1 left-0 w-full h-[1.5px] bg-accent scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></span>
  </a>
);

const CategoryDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const { user } = useAuth();
  const router = useRouter();
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/categories`
        );
        if (response.data) {
          setCategories(response.data);
        }
      } catch (error) {
        console.log("Error in the categories fetching: ", error);
      }
    };
    fetchCategories();
  }, []);

  const handleCategoryClick = (cat) => {
    if (user) {
      sessionStorage.setItem("selectedCategory", JSON.stringify(cat));
      router.push(`/${cat.name.toLowerCase().replace(/ /g, "_")}`);
    } else {
      router.push("/login");
    }
  };
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
            <button
              key={cat._id}
              onClick={() => handleCategoryClick(cat)}
              className="block px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const Sidebar = ({ isOpen, closeSidebar }) => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios(
          `${process.env.NEXT_PUBLIC_API_URL}/categories`
        );
        const data = response.data;
        console.log(response.data);
        setCategories(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const formatUrl = (text) => text.toLowerCase().replace(/ /g, "_");

  const handleNavigation = (href) => {
    if (user) {
      router.push(href);
    } else {
      router.push("/login");
    }
    closeSidebar();
  };
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
                <p className="font-semibold text-foreground">
                  {user?.name || "Guest"}
                </p>
              </div>
            </div>
            <button
              onClick={closeSidebar}
              className="p-2 rounded-full hover:bg-accent/10 hover:text-accent transition-colors duration-200"
            >
              <FiX />
            </button>
          </div>

          <nav className="flex-grow px-4 space-y-1.5 overflow-y-auto">
            <button
              onClick={() => handleNavigation("/")}
              className="w-full flex items-center gap-3 py-2.5 px-4 hover:bg-accent/10 hover:text-accent rounded-md transition-colors duration-200"
            >
              <FiHome /> Home
            </button>
            <button
              onClick={() => handleNavigation("/profile")}
              className="w-full flex items-center gap-3 py-2.5 px-4 hover:bg-accent/10 hover:text-accent rounded-md transition-colors duration-200"
            >
              <FiUser /> User Profile
            </button>
            <button
              onClick={() => handleNavigation("/quiz")}
              className="w-full flex items-center gap-3 py-2.5 px-4 hover:bg-accent/10 hover:text-accent rounded-md transition-colors duration-200"
            >
              <FiHelpCircle /> AI Quiz
            </button>
            <button
              onClick={() => handleNavigation("/mental_maths")}
              className="w-full flex items-center gap-3 py-2.5 px-4 hover:bg-accent/10 hover:text-accent rounded-md transition-colors duration-200"
            >
              <FiZap /> Mental Maths
            </button>

            {loading ? (
              <div className="py-4 text-center text-muted-foreground text-sm">
                Loading categories...
              </div>
            ) : (
              categories.map((category) => (
                <div key={category._id}>
                  <button
                    key={category._id}
                    onClick={() =>
                      handleNavigation(`/${formatUrl(category.name)}`)
                    }
                    className="w-full flex items-center gap-3 py-2.5 px-4 hover:bg-accent/10 hover:text-accent rounded-md transition-colors duration-200"
                  >
                    {category.name}
                  </button>
                </div>
              ))
            )}

            <button
              onClick={() => handleNavigation("/#about-us")}
              className="w-full flex items-center gap-3 py-2.5 px-4 hover:bg-accent/10 hover:text-accent rounded-md transition-colors duration-200"
            >
              <FiInfo /> About
            </button>
            <button
              onClick={() => handleNavigation("/#contact-us")}
              className="w-full flex items-center gap-3 py-2.5 px-4 hover:bg-accent/10 hover:text-accent rounded-md transition-colors duration-200"
            >
              <FiMail /> Contact
            </button>
          </nav>

          <div className="p-4 border-t border-border/50">
            {user ? (
              <button
                onClick={logout}
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-red-500/20 hover:bg-red-500 text-red-500 hover:text-white rounded-lg font-semibold transition-colors"
              >
                <FiLogIn />
                <span>Logout</span>
              </button>
            ) : (
              <button
                onClick={() => handleNavigation("/login")}
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-accent/10 hover:bg-accent text-accent hover:text-accent-foreground rounded-lg font-semibold transition-colors"
              >
                <FiLogIn />
                <span>Login</span>
              </button>
            )}
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
      {user?.role === "admin" ? (
        <a
          href="/admin"
          className="px-4 py-2 bg-purple-500/20 text-purple-500 font-semibold rounded-lg hover:bg-purple-500 hover:text-white transition-colors duration-300"
        >
          Admin Panel
        </a>
      ) : (
        <a
          href="/profile"
          className="relative p-2.5 rounded-full hover:bg-accent/10 hover:text-accent transition-colors duration-200"
        >
          <FiUser />
        </a>
      )}
      <button
        onClick={logout}
        className="px-6 py-2 bg-red-500/20 text-red-500 font-semibold rounded-lg hover:bg-red-500 hover:text-white transition-colors duration-300"
      >
        Logout
      </button>
    </div>
  ) : (
    <a
      href="/login"
      className="hidden sm:block px-6 py-2 bg-accent/20 text-accent font-semibold rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors duration-300"
    >
      Login
    </a>
  );
  return (
    <>
      <header className="fixed top-0 inset-x-0 z-40 bg-muted/10 backdrop-blur-lg border-b border-border/50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-6">
              {user?.role !== "admin" && (
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="p-2 -ml-2 text-foreground cursor-pointer"
                >
                  <FiMenu size={24} />
                </button>
              )}
              <a href="/" className="flex items-center gap-2">
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
              </a>
            </div>

            {user?.role !== "admin" && (
              <div className="hidden min-[900px]:flex items-center space-x-8">
                <NavLink href="/">Home</NavLink>
                <CategoryDropdown />
                {user && <NavLink href="/quiz">AI Quiz</NavLink>}
                <NavLink href="/mental_maths">Mental Maths</NavLink>
                <NavLink href="/#about-us">About</NavLink>
              </div>
            )}

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
