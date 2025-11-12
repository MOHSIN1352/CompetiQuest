import Question from "../Models/QuestionModel.js";
import Topic from "../Models/TopicModel.js";

// Get all questions with filters
export const getAllQuestions = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      difficulty,
      subjects,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;
    let query = {};

    if (search) query.question_text = { $regex: search, $options: "i" };
    if (difficulty) query.difficulty = difficulty;
    if (subjects) query.subjects = { $in: subjects.split(",") };

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

    const questions = await Question.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort(sortOptions);

    const total = await Question.countDocuments(query);

    res.status(200).json({
      questions,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Get question by ID
export const getQuestionById = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question)
      return res.status(404).json({ message: "Question not found" });
    res.status(200).json(question);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const getQuestionsByTopicId = async (req, res) => {
  try {
    const { topicId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const topic = await Topic.findById(topicId);
    if (!topic) {
      return res.status(404).json({ message: "Topic not found" });
    }

    const query = { topic: topicId };

    const [questions, totalQuestions] = await Promise.all([
      Question.find(query)
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 })
        .select("-__v"),
      Question.countDocuments(query),
    ]);

    res.status(200).json({
      topic: {
        _id: topic._id,
        name: topic.name,
        description: topic.description || "",
      },
      questions,
      totalQuestions,
      totalPages: Math.ceil(totalQuestions / limit),
      currentPage: page,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid Topic ID format" });
    }
    console.error("Error fetching questions:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
