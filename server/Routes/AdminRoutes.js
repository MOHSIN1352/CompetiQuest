// routes/admin.js
import express from "express";
import Category from "../Models/CategoryModel.js";
import Topic from "../Models/TopicModel.js";
import Question from "../Models/QuestionModel.js";
import User from "../Models/UserModel.js";

const router = express.Router();

router.get("/overview", async (req, res) => {
  try {
    // 1️⃣ Fetch all raw data in parallel
    const [usersCount, categories, topics, questions] = await Promise.all([
      User.countDocuments(),
      Category.find().lean(),
      Topic.find().lean(),
      Question.find().lean(),
    ]);

    // 2️⃣ Calculate question counts per topic
    const topicCounts = {};
    topics.forEach((topic) => {
      topicCounts[topic._id.toString()] = 0; // initialize count
    });

    questions.forEach((q) => {
      const topicId = q.topic?.toString();
      if (topicId && topicCounts.hasOwnProperty(topicId)) {
        topicCounts[topicId] += 1;
      }
    });

    // 3️⃣ Merge topics into categories, including question counts
    const topicsByCategory = topics.reduce((acc, t) => {
      const catId = t.category?.toString();
      if (!acc[catId]) acc[catId] = [];
      acc[catId].push({
        _id: t._id,
        name: t.name,
        description: t.description,
        questionCount: topicCounts[t._id.toString()],
      });
      return acc;
    }, {});

    const result = categories.map((cat) => ({
      ...cat,
      topics: topicsByCategory[cat._id?.toString()] || [],
    }));

    // 4️⃣ Send all raw data + counts in response
    res.json({
      usersCount,
      categories: result,
      rawData: { categories, topics, questions }, // optional for frontend
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load admin overview" });
  }
});

export default router;
