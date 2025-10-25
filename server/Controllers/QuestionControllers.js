import Question from '../Models/QuestionModel.js';

// Create a new question
export const createQuestion = async (req, res) => {
    try {
        const { question_text, options, correct_option_index, difficulty, subjects } = req.body;

        if (!question_text || !options || correct_option_index === undefined) {
            return res.status(400).json({
                message: 'Question text, options, and correct option index are required'
            });
        }

        if (options.length < 2) {
            return res.status(400).json({ message: 'At least two options are required' });
        }

        if (correct_option_index < 0 || correct_option_index >= options.length) {
            return res.status(400).json({ message: 'Correct option index must be within options range' });
        }

        const questionExists = await Question.findOne({ question_text });
        if (questionExists) {
            return res.status(400).json({ message: 'Question with this text already exists' });
        }

        const question = await Question.create({
            question_text,
            options,
            correct_option_index,
            difficulty: difficulty || 'medium',
            subjects: subjects || []
        });

        res.status(201).json(question);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Get all questions with filters
export const getAllQuestions = async (req, res) => {
    try {
        const { page = 1, limit = 10, search, difficulty, subjects, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
        let query = {};

        if (search) query.question_text = { $regex: search, $options: 'i' };
        if (difficulty) query.difficulty = difficulty;
        if (subjects) query.subjects = { $in: subjects.split(',') };

        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const questions = await Question.find(query)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort(sortOptions);

        const total = await Question.countDocuments(query);

        res.status(200).json({
            questions,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Get question by ID
export const getQuestionById = async (req, res) => {
    try {
        const question = await Question.findById(req.params.id);
        if (!question) return res.status(404).json({ message: 'Question not found' });
        res.status(200).json(question);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Update question
export const updateQuestion = async (req, res) => {
    try {
        const { question_text, options, correct_option_index, difficulty, subjects } = req.body;
        const question = await Question.findById(req.params.id);
        if (!question) return res.status(404).json({ message: 'Question not found' });

        if (options && options.length < 2) {
            return res.status(400).json({ message: 'At least two options are required' });
        }

        if (correct_option_index !== undefined) {
            const optionsToCheck = options || question.options;
            if (correct_option_index < 0 || correct_option_index >= optionsToCheck.length) {
                return res.status(400).json({ message: 'Correct option index must be within options range' });
            }
        }

        if (question_text && question_text !== question.question_text) {
            const exists = await Question.findOne({ question_text });
            if (exists) return res.status(400).json({ message: 'Question with this text already exists' });
        }

        question.question_text = question_text || question.question_text;
        question.options = options || question.options;
        question.correct_option_index = correct_option_index !== undefined ? correct_option_index : question.correct_option_index;
        question.difficulty = difficulty || question.difficulty;
        question.subjects = subjects || question.subjects;

        const updatedQuestion = await question.save();
        res.status(200).json(updatedQuestion);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Delete question
export const deleteQuestion = async (req, res) => {
    try {
        const question = await Question.findById(req.params.id);
        if (!question) return res.status(404).json({ message: 'Question not found' });

        await Question.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Question deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Get questions by difficulty
export const getQuestionsByDifficulty = async (req, res) => {
    try {
        const { difficulty } = req.params;
        const { page = 1, limit = 10 } = req.query;

        if (!['easy', 'medium', 'hard'].includes(difficulty)) {
            return res.status(400).json({ message: 'Invalid difficulty level' });
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
            total
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
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
            total
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Search questions
export const searchQuestions = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.status(400).json({ message: 'Search query is required' });

        const questions = await Question.find({
            $or: [
                { question_text: { $regex: q, $options: 'i' } },
                { subjects: { $in: [new RegExp(q, 'i')] } }
            ]
        }).limit(10);

        res.status(200).json(questions);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
