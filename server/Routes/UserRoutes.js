const express = require("express");
const router = express.Router();

const { 
    getUserProfile, 
    updateUserProfile, 
    changePassword, 
    getUserQuizHistory, 
    deleteUser, 
    getAllUsers 
} = require("../Controllers/UserControllers");

const { protect, admin } = require("../Middleware/AuthMiddleware");

router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateUserProfile);
router.put("/change-password", protect, changePassword);
router.get("/quiz-history", protect, getUserQuizHistory);
router.delete("/delete", protect, deleteUser);

router.get("/all", protect, admin, getAllUsers);

module.exports = router;
