const express = require("express");
const router = express.Router();

const {
    createTopic,
    getAllTopics,
    getTopicById,
    updateTopic,
    deleteTopic,
    addSubjectToTopic,
    removeSubjectFromTopic,
    getAllSubjects,
    searchTopics
} = require("../Controllers/TopicControllers");


const { protect, admin } = require("../Middleware/AuthMiddleware");


router.get("/", getAllTopics);
router.get("/search", searchTopics);
router.get("/subjects", getAllSubjects);
router.get("/:id", getTopicById);


router.post("/", protect, admin, createTopic);
router.put("/:id", protect, admin, updateTopic);
router.delete("/:id", protect, admin, deleteTopic);
router.post("/:id/subjects", protect, admin, addSubjectToTopic);
router.delete("/:id/subjects", protect, admin, removeSubjectFromTopic);

module.exports = router;
