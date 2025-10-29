// layout.js
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { ThemeProvider } from "./context/ThemeContext";
// import ChatBotProvider from "../components/ChatBotProvider";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/context/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "CompetiQuest",
  description: "Your one-stop solution for competitive exam preparation",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans bg-ivory dark:bg-darkPrimary text-darkPrimary dark:text-white transition-colors duration-300`}
      >
        <ThemeProvider>
          <AuthProvider>
            <Navbar />
            {children}
            <Footer />
            {/* <ChatBotProvider /> */}
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
