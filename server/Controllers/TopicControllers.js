import Topic from "../Models/TopicModel.js";

// Get all topics with optional search & pagination
export const getAllTopics = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, subject } = req.query;
    let query = {};

    if (search) query.name = { $regex: search, $options: "i" };
    if (subject) query.subjects = { $in: [subject] };

    const topics = await Topic.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ created_at: -1 });

    const total = await Topic.countDocuments(query);

    res.status(200).json({
      topics,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Get topic by ID
export const getTopicById = async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id);
    if (!topic) return res.status(404).json({ message: "Topic not found" });
    res.status(200).json(topic);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

//Get topic by categoryid

export const getTopicsByCategoryId = async (req, res) => {
  try {
    const { categoryId } = req.params;

    if (!categoryId) {
      return res.status(400).json({ message: "Category ID is required" });
    }

    // This query assumes your Topic model has a field named 'category'
    // that stores the ObjectId of the parent category.
    const topics = await Topic.find({ category: categoryId }).sort({
      created_at: -1,
    });

    // Return an empty array if no topics are found (not an error)
    res.status(200).json(topics);
  } catch (error) {
    // Handle potential CastError if the ID format is invalid
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid Category ID format" });
    }
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
