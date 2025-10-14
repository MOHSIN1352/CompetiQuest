const express = require("express");
const router = express.Router();

const {
    createQuestion,
    getAllQuestions,
    getQuestionById,
    updateQuestion,
    deleteQuestion,
    getQuestionsByDifficulty,
    getQuestionsBySubject,
    getQuestionsByCompany,
    getRandomQuestions,
    searchQuestions
} = require("../Controllers/QuestionControllers");

        
const { protect, admin } = require("../Middleware/AuthMiddleware");


router.get("/", getAllQuestions);
router.get("/search", searchQuestions);
router.get("/random", getRandomQuestions);
router.get("/difficulty/:difficulty", getQuestionsByDifficulty);
router.get("/subject/:subject", getQuestionsBySubject);
router.get("/company/:companyId", getQuestionsByCompany);
router.get("/:id", getQuestionById);

router.post("/", protect, admin, createQuestion);
router.put("/:id", protect, admin, updateQuestion);
router.delete("/:id", protect, admin, deleteQuestion);

module.exports = router;
