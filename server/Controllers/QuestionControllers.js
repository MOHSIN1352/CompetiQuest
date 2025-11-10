import Question from "../Models/QuestionModel.js";
import Topic from "../Models/TopicModel.js";

// Create a new question
export const createQuestion = async (req, res) => {
  try {
    // Updated to match your new schema
    const {
      questionText,
      options,
      correctOptionIndex,
      difficulty,
      topic,
      explanation,
    } = req.body;

    // Updated validation
    if (
      !questionText ||
      !options ||
      correctOptionIndex === undefined ||
      !topic
    ) {
      return res.status(400).json({
        message:
          "Question text, options, correct option index, and topic ID are required",
      });
    }

    // --- (Validation from your schema, good to double-check here) ---
    if (!Array.isArray(options) || options.length < 2 || options.length > 6) {
      return res
        .status(400)
        .json({ message: "Options must be an array with 2 to 6 items." });
    }

    if (correctOptionIndex < 0 || correctOptionIndex >= options.length) {
      return res.status(400).json({
        message: "Correct option index must be a valid index in options array.",
      });
    }
    // -----------------------------------------------------------------

    // (Optional but Recommended) Check if the topic exists
    const topicExists = await Topic.findById(topic);
    if (!topicExists) {
      return res.status(404).json({ message: "Topic not found with this ID" });
    }

    // Check for duplicate question text
    const questionExists = await Question.findOne({ questionText });
    if (questionExists) {
      return res
        .status(400)
        .json({ message: "Question with this text already exists" });
    }

    // Create question with new schema fields
    const question = await Question.create({
      questionText,
      options,
      correctOptionIndex,
      difficulty: difficulty || "medium", // Uses default from schema
      topic, // The required ObjectId
      explanation: explanation || "", // Uses default from schema
    });

    res.status(201).json(question);
  } catch (error) {
    // Handle CastError if 'topic' is not a valid ObjectId format
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid Topic ID format" });
    }
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

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

//get question by topic id

// export const getQuestionsByTopicId = async (req, res) => {
//     try {
//         const { topicId } = req.params;
//         const { page = 1, limit = 10 } = req.query;

//         // 1. Find the topic to get its subjects
//         const topic = await Topic.findById(topicId);
//         if (!topic) {
//             return res.status(404).json({ message: 'Topic not found' });
//         }

//         // 2. Get the subjects from the topic
//         const subjects = topic.subjects;
//         if (!subjects || subjects.length === 0) {
//             // If topic has no subjects, return no questions
//             return res.status(200).json({
//                 questions: [],
//                 totalPages: 0,
//                 currentPage: 1,
//                 total: 0
//             });
//         }

//         // 3. Find all questions that have at least one of those subjects
//         const query = { subjects: { $in: subjects } };

//         const questions = await Question.find(query)
//             .limit(limit * 1)
//             .skip((page - 1) * limit)
//             .sort({ createdAt: -1 });

//         const total = await Question.countDocuments(query);

//         res.status(200).json({
//             questions,
//             totalPages: Math.ceil(total / limit),
//             currentPage: page,
//             total
//         });

//     } catch (error) {
//         // Handle potential CastError if the ID format is invalid
//         if (error.name === 'CastError') {
//             return res.status(400).json({ message: 'Invalid Topic ID format' });
//         }
//         res.status(500).json({ message: 'Server Error', error: error.message });
//     }
// };
// ✅ Controller: Get paginated questions by topicId
// ✅ Controller: Get paginated questions by topicId
export const getQuestionsByTopicId = async (req, res) => {
  try {
    const { topicId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // 1️⃣ Validate topic exists
    const topic = await Topic.findById(topicId);
    if (!topic) {
      return res.status(404).json({ message: "Topic not found" });
    }

    // 2️⃣ Find questions that belong to this topic
    const query = { topic: topicId };

    const [questions, totalQuestions] = await Promise.all([
      Question.find(query)
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 })
        .select("-__v"),
      Question.countDocuments(query),
    ]);

    // 3️⃣ Return structured data for frontend
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

// Update question
export const updateQuestion = async (req, res) => {
  try {
    const {
      question_text,
      options,
      correct_option_index,
      difficulty,
      subjects,
    } = req.body;
    const question = await Question.findById(req.params.id);
    if (!question)
      return res.status(404).json({ message: "Question not found" });

    if (options && options.length < 2) {
      return res
        .status(400)
        .json({ message: "At least two options are required" });
    }

    if (correct_option_index !== undefined) {
      const optionsToCheck = options || question.options;
      if (
        correct_option_index < 0 ||
        correct_option_index >= optionsToCheck.length
      ) {
        return res.status(400).json({
          message: "Correct option index must be within options range",
        });
      }
    }

    if (questionText && questionText !== question.questionText) {
      const exists = await Question.findOne({ questionText });
      if (exists)
        return res
          .status(400)
          .json({ message: "Question with this text already exists" });
    }

    question.questionText = question_text || question.questionText;
    question.options = options || question.options;
    question.correctOptionIndex =
      correctOptionIndex !== undefined
        ? correctOptionIndex
        : question.correctOptionIndex;
    question.difficulty = difficulty || question.difficulty;
    question.subjects = subjects || question.subjects;

    const updatedQuestion = await question.save();
    res.status(200).json(updatedQuestion);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Delete question
export const deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question)
      return res.status(404).json({ message: "Question not found" });

    await Question.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Question deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Get questions by difficulty
export const getQuestionsByDifficulty = async (req, res) => {
  try {
    const { difficulty } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!["easy", "medium", "hard"].includes(difficulty)) {
      return res.status(400).json({ message: "Invalid difficulty level" });
    }

    const questions = await Question.find({ difficulty })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Question.countDocuments({ difficulty });

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

// Get questions by subject
export const getQuestionsBySubject = async (req, res) => {
  try {
    const { subject } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const questions = await Question.find({ subjects: subject })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Question.countDocuments({ subjects: subject });

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

// Search questions
export const searchQuestions = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q)
      return res.status(400).json({ message: "Search query is required" });

    const questions = await Question.find({
      $or: [
        { question_text: { $regex: q, $options: "i" } },
        { subjects: { $in: [new RegExp(q, "i")] } },
      ],
    }).limit(10);

    res.status(200).json(questions);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Get random questions
export const getRandomQuestions = async (req, res) => {
  try {
    const { count = 10, difficulty, subjects } = req.query;
    let query = {};

    if (difficulty) query.difficulty = difficulty;
    if (subjects) query.subjects = { $in: subjects.split(",") };

    const questions = await Question.aggregate([
      { $match: query },
      { $sample: { size: parseInt(count) } },
    ]);

    res.status(200).json(questions);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};