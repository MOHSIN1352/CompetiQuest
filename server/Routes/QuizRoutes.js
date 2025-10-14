const express = require("express");
const router = express.Router();

const {
    startQuiz,
    submitQuiz,
    getQuizAttempt,
    getUserQuizHistory,
    getAllQuizAttempts,
    getUserQuizStats,
    getLeaderboard,
    deleteQuizAttempt
} = require("../Controllers/QuizControllers");

const { protect, admin } = require("../Middleware/AuthMiddleware");

router.post("/start", protect, startQuiz);
router.post("/submit", protect, submitQuiz);
router.get("/history", protect, getUserQuizHistory);
router.get("/stats", protect, getUserQuizStats);
router.get("/leaderboard", getLeaderboard);
router.get("/attempt/:id", protect, getQuizAttempt);
router.delete("/attempt/:id", protect, deleteQuizAttempt);


router.get("/all", protect, admin, getAllQuizAttempts);

module.exports = router;
