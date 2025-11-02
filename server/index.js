import express, { json } from "express";
import { config } from "dotenv";
import connectDB from "./Database/Connection.js";
import cors from "cors";
import cookieParser from "cookie-parser";

config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(json());
app.use(cookieParser());

// Routes
import authRoutes from "./Routes/AuthRoutes.js";
import userRoutes from "./Routes/UserRoutes.js";
import companyRoutes from "./Routes/CompanyRoutes.js";
import topicRoutes from "./Routes/TopicRoutes.js";
import questionRoutes from "./Routes/QuestionRoutes.js";
import quizRoutes from "./Routes/QuizRoutes.js";
import categoryRoutes from "./Routes/CategoryRoutes.js";
import adminRoutes from "./Routes/AdminRoutes.js";

// API Endpoints
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/topics", topicRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/categories", categoryRoutes); // New

// Health Check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(500)
    .json({ message: "Something went wrong!", error: err.message });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
