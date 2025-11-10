import express, { json } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from '../../Routes/AuthRoutes.js';
import userRoutes from '../../Routes/UserRoutes.js';
import categoryRoutes from '../../Routes/CategoryRoutes.js';
import companyRoutes from '../../Routes/CompanyRoutes.js';
import topicRoutes from '../../Routes/TopicRoutes.js';
import questionRoutes from '../../Routes/QuestionRoutes.js';
import quizRoutes from '../../Routes/QuizRoutes.js';

// Create Express app for testing (without DB connection in index.js)
export const createTestApp = () => {
  const app = express();

  // Middleware
  app.use(cors({
    origin: "http://localhost:3000",
    credentials: true,
  }));
  app.use(json());
  app.use(cookieParser());

  // Routes
  app.use("/api/auth", authRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/companies", companyRoutes);
  app.use("/api/topics", topicRoutes);
  app.use("/api/questions", questionRoutes);
  app.use("/api/quiz", quizRoutes);
  app.use("/api/categories", categoryRoutes);

  // Health Check
  app.get("/api/health", (req, res) => {
    res.status(200).json({
      message: "Server is running",
      timestamp: new Date().toISOString(),
    });
  });

  // Error Handler
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Something went wrong!", error: err.message });
  });

  // 404 Handler
  app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
  });

  return app;
};

