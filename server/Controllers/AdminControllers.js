import Category from '../Models/CategoryModel.js';
import Topic from '../Models/TopicModel.js';
import Question from '../Models/QuestionModel.js';
import User from '../Models/UserModel.js';

// ==================== CATEGORY CRUD ====================

// Get all categories
export const getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, categories });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching categories', error: error.message });
    }
};

// Create category
export const createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        
        if (!name) {
            return res.status(400).json({ success: false, message: 'Category name is required' });
        }

        const category = await Category.create({ name, description });
        res.status(201).json({ success: true, category, message: 'Category created successfully' });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'Category name already exists' });
        }
        res.status(500).json({ success: false, message: 'Error creating category', error: error.message });
    }
};

// Update category
export const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;

        const category = await Category.findByIdAndUpdate(
            id, 
            { name, description }, 
            { new: true, runValidators: true }
        );

        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }

        res.status(200).json({ success: true, category, message: 'Category updated successfully' });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'Category name already exists' });
        }
        res.status(500).json({ success: false, message: 'Error updating category', error: error.message });
    }
};

// Delete category
export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        console.log(`Attempting to delete category with ID: ${id}`);

        // Check if category exists first
        const category = await Category.findById(id);
        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }

        console.log(`Found category: ${category.name}`);

        // Get all topics in this category
        const topics = await Topic.find({ category: id });
        console.log(`Found ${topics.length} topics in this category`);
        
        // Delete questions for each topic
        for (const topic of topics) {
            const deletedQuestions = await Question.deleteMany({ topic: topic._id });
            console.log(`Deleted ${deletedQuestions.deletedCount} questions for topic: ${topic.name}`);
        }
        
        // Delete all topics in this category
        const deletedTopics = await Topic.deleteMany({ category: id });
        console.log(`Deleted ${deletedTopics.deletedCount} topics`);
        
        // Finally delete the category
        const deletedCategory = await Category.findByIdAndDelete(id);
        console.log(`Category deleted: ${deletedCategory.name}`);

        res.status(200).json({ 
            success: true, 
            message: 'Category deleted successfully',
            details: {
                category: deletedCategory.name,
                topicsDeleted: deletedTopics.deletedCount,
                questionsDeleted: topics.reduce((sum, topic) => sum + (topic.questionsCount || 0), 0)
            }
        });
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({ success: false, message: 'Error deleting category', error: error.message });
    }
};

// ==================== TOPIC CRUD ====================

// Get topics by category
export const getTopicsByCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const topics = await Topic.find({ category: categoryId })
            .populate('category', 'name')
            .sort({ createdAt: -1 });
        
        res.status(200).json({ success: true, topics });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching topics', error: error.message });
    }
};

// Get all topics
export const getAllTopics = async (req, res) => {
    try {
        const topics = await Topic.find()
            .populate('category', 'name')
            .sort({ createdAt: -1 });
        
        res.status(200).json({ success: true, topics });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching topics', error: error.message });
    }
};

// Create topic
export const createTopic = async (req, res) => {
    try {
        const { name, description, category, subjects } = req.body;
        
        if (!name || !category) {
            return res.status(400).json({ success: false, message: 'Topic name and category are required' });
        }

        const topic = await Topic.create({ name, description, category, subjects });
        await topic.populate('category', 'name');
        
        res.status(201).json({ success: true, topic, message: 'Topic created successfully' });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'Topic name already exists in this category' });
        }
        res.status(500).json({ success: false, message: 'Error creating topic', error: error.message });
    }
};

// Update topic
export const updateTopic = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, category, subjects } = req.body;

        const topic = await Topic.findByIdAndUpdate(
            id, 
            { name, description, category, subjects }, 
            { new: true, runValidators: true }
        ).populate('category', 'name');

        if (!topic) {
            return res.status(404).json({ success: false, message: 'Topic not found' });
        }

        res.status(200).json({ success: true, topic, message: 'Topic updated successfully' });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'Topic name already exists in this category' });
        }
        res.status(500).json({ success: false, message: 'Error updating topic', error: error.message });
    }
};

// Delete topic
export const deleteTopic = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if topic has questions
        const questionsCount = await Question.countDocuments({ topic: id });
        if (questionsCount > 0) {
            return res.status(400).json({ 
                success: false, 
                message: `Cannot delete topic. It has ${questionsCount} questions. Delete questions first.` 
            });
        }

        const topic = await Topic.findByIdAndDelete(id);
        if (!topic) {
            return res.status(404).json({ success: false, message: 'Topic not found' });
        }

        res.status(200).json({ success: true, message: 'Topic deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error deleting topic', error: error.message });
    }
};

// ==================== QUESTION CRUD ====================

// Get questions by topic
export const getQuestionsByTopic = async (req, res) => {
    try {
        const { topicId } = req.params;
        const { page = 1, limit = 10 } = req.query;
        
        const questions = await Question.find({ topic: topicId })
            .populate('topic', 'name')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Question.countDocuments({ topic: topicId });
        
        res.status(200).json({ 
            success: true, 
            questions,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                total,
                limit
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching questions', error: error.message });
    }
};

// Get all questions
export const getAllQuestions = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        
        const questions = await Question.find()
            .populate('topic', 'name')
            .populate({
                path: 'topic',
                populate: {
                    path: 'category',
                    select: 'name'
                }
            })
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Question.countDocuments();
        
        res.status(200).json({ 
            success: true, 
            questions,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                total,
                limit
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching questions', error: error.message });
    }
};

// Create question
export const createQuestion = async (req, res) => {
    try {
        const { questionText, options, correctOptionIndex, topic, difficulty, explanation } = req.body;
        
        if (!questionText || !options || correctOptionIndex === undefined || !topic) {
            return res.status(400).json({ 
                success: false, 
                message: 'Question text, options, correct option index, and topic are required' 
            });
        }

        if (!Array.isArray(options) || options.length < 2) {
            return res.status(400).json({ 
                success: false, 
                message: 'Options must be an array with at least 2 items' 
            });
        }

        if (correctOptionIndex < 0 || correctOptionIndex >= options.length) {
            return res.status(400).json({ 
                success: false, 
                message: 'Correct option index must be valid' 
            });
        }

        const question = await Question.create({
            questionText,
            options,
            correctOptionIndex,
            topic,
            difficulty,
            explanation
        });

        await question.populate('topic', 'name');
        
        res.status(201).json({ success: true, question, message: 'Question created successfully' });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'Question already exists' });
        }
        res.status(500).json({ success: false, message: 'Error creating question', error: error.message });
    }
};

// Update question
export const updateQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        const { questionText, options, correctOptionIndex, topic, difficulty, explanation } = req.body;

        if (options && (!Array.isArray(options) || options.length < 2)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Options must be an array with at least 2 items' 
            });
        }

        if (correctOptionIndex !== undefined && options && (correctOptionIndex < 0 || correctOptionIndex >= options.length)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Correct option index must be valid' 
            });
        }

        const question = await Question.findByIdAndUpdate(
            id, 
            { questionText, options, correctOptionIndex, topic, difficulty, explanation }, 
            { new: true, runValidators: true }
        ).populate('topic', 'name');

        if (!question) {
            return res.status(404).json({ success: false, message: 'Question not found' });
        }

        res.status(200).json({ success: true, question, message: 'Question updated successfully' });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'Question already exists' });
        }
        res.status(500).json({ success: false, message: 'Error updating question', error: error.message });
    }
};

// Delete question
export const deleteQuestion = async (req, res) => {
    try {
        const { id } = req.params;

        const question = await Question.findByIdAndDelete(id);
        if (!question) {
            return res.status(404).json({ success: false, message: 'Question not found' });
        }

        res.status(200).json({ success: true, message: 'Question deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error deleting question', error: error.message });
    }
};

// ==================== ADMIN DASHBOARD ====================

// Get admin dashboard stats
export const getDashboardStats = async (req, res) => {
    try {
        const [categoriesCount, topicsCount, questionsCount, usersCount] = await Promise.all([
            Category.countDocuments(),
            Topic.countDocuments(),
            Question.countDocuments(),
            User.countDocuments()
        ]);

        const recentCategories = await Category.find().sort({ createdAt: -1 }).limit(5);
        const recentTopics = await Topic.find().populate('category', 'name').sort({ createdAt: -1 }).limit(5);
        const recentQuestions = await Question.find().populate('topic', 'name').sort({ createdAt: -1 }).limit(5);

        res.status(200).json({
            success: true,
            stats: {
                categoriesCount,
                topicsCount,
                questionsCount,
                usersCount
            },
            recent: {
                categories: recentCategories,
                topics: recentTopics,
                questions: recentQuestions
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching dashboard stats', error: error.message });
    }
};