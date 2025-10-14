const QuizAttempt = require('../Models/QuizModel');
const Question = require('../Models/QuestionModel');
const Topic = require('../Models/TopicModel');
const User = require('../Models/UserModel');

exports.startQuiz = async (req, res) => {
    try {
        const { topicId, questionCount = 10, difficulty, subjects, companies } = req.body;
        const userId = req.user.id;

        const topic = await Topic.findById(topicId);
        if (!topic) {
            return res.status(404).json({ message: 'Topic not found' });
        }

        let query = {};
        
        if (difficulty) {
            query.difficulty = difficulty;
        }

        if (subjects && subjects.length > 0) {
            query.subjects = { $in: subjects };
        }

        if (companies && companies.length > 0) {
            query.companies = { $in: companies };
        }

        
        const questions = await Question.aggregate([
            { $match: query },
            { $sample: { size: parseInt(questionCount) } },
            {
                $lookup: {
                    from: 'companies',
                    localField: 'companies',
                    foreignField: '_id',
                    as: 'companies'
                }
            },
            {
                $project: {
                    correct_option_index: 0 
                }
            }
        ]);

        if (questions.length === 0) {
            return res.status(404).json({ message: 'No questions found with the specified criteria' });
        }

        // Create quiz attempt
        const quizAttempt = await QuizAttempt.create({
            user: userId,
            topic: topicId,
            questions: questions.map(q => ({
                question_id: q._id,
                selected_option_index: null,
                is_correct: null
            })),
            score: 0,
            percentage: 0
        });

        res.status(201).json({
            quizAttemptId: quizAttempt._id,
            topic: topic.name,
            questions: questions,
            totalQuestions: questions.length
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Submit quiz answers
exports.submitQuiz = async (req, res) => {
    try {
        const { quizAttemptId, answers } = req.body;
        const userId = req.user.id;

        // Find quiz attempt
        const quizAttempt = await QuizAttempt.findById(quizAttemptId)
            .populate('questions.question_id');

        if (!quizAttempt) {
            return res.status(404).json({ message: 'Quiz attempt not found' });
        }

        // Verify user owns this quiz attempt
        if (quizAttempt.user.toString() !== userId) {
            return res.status(403).json({ message: 'Not authorized to access this quiz attempt' });
        }

        // Check if quiz is already submitted
        if (quizAttempt.score > 0) {
            return res.status(400).json({ message: 'Quiz has already been submitted' });
        }

        let correctAnswers = 0;
        const totalQuestions = quizAttempt.questions.length;

        // Process each answer
        for (let i = 0; i < answers.length; i++) {
            const answer = answers[i];
            const questionData = quizAttempt.questions[i];
            
            if (questionData.question_id) {
                const isCorrect = answer.selected_option_index === questionData.question_id.correct_option_index;
                
                questionData.selected_option_index = answer.selected_option_index;
                questionData.is_correct = isCorrect;
                
                if (isCorrect) {
                    correctAnswers++;
                }
            }
        }

        // Calculate score and percentage
        const score = correctAnswers;
        const percentage = (correctAnswers / totalQuestions) * 100;

        quizAttempt.score = score;
        quizAttempt.percentage = percentage;

        await quizAttempt.save();

        // Add to user's quiz history
        await User.findByIdAndUpdate(userId, {
            $push: { quiz_history: quizAttemptId }
        });

        res.status(200).json({
            score,
            percentage: Math.round(percentage * 100) / 100,
            correctAnswers,
            totalQuestions,
            questions: quizAttempt.questions.map(q => ({
                question_id: q.question_id._id,
                selected_option_index: q.selected_option_index,
                is_correct: q.is_correct,
                correct_option_index: q.question_id.correct_option_index
            }))
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Get quiz attempt by ID
exports.getQuizAttempt = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const quizAttempt = await QuizAttempt.findById(id)
            .populate('user', 'name email')
            .populate('topic', 'name description')
            .populate('questions.question_id');

        if (!quizAttempt) {
            return res.status(404).json({ message: 'Quiz attempt not found' });
        }

        // Verify user owns this quiz attempt or is admin
        if (quizAttempt.user._id.toString() !== userId && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to access this quiz attempt' });
        }

        res.status(200).json(quizAttempt);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Get user's quiz history
exports.getUserQuizHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const { page = 1, limit = 10 } = req.query;

        const quizAttempts = await QuizAttempt.find({ user: userId })
            .populate('topic', 'name description')
            .sort({ attempted_at: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await QuizAttempt.countDocuments({ user: userId });

        res.status(200).json({
            quizAttempts,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Get all quiz attempts (admin only)
exports.getAllQuizAttempts = async (req, res) => {
    try {
        const { page = 1, limit = 10, user, topic } = req.query;

        let query = {};

        if (user) {
            query.user = user;
        }

        if (topic) {
            query.topic = topic;
        }

        const quizAttempts = await QuizAttempt.find(query)
            .populate('user', 'name email')
            .populate('topic', 'name description')
            .sort({ attempted_at: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await QuizAttempt.countDocuments(query);

        res.status(200).json({
            quizAttempts,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Get quiz statistics for user
exports.getUserQuizStats = async (req, res) => {
    try {
        const userId = req.user.id;

        const stats = await QuizAttempt.aggregate([
            { $match: { user: userId } },
            {
                $group: {
                    _id: null,
                    totalAttempts: { $sum: 1 },
                    averageScore: { $avg: '$score' },
                    averagePercentage: { $avg: '$percentage' },
                    highestScore: { $max: '$score' },
                    highestPercentage: { $max: '$percentage' },
                    totalQuestions: { $sum: { $size: '$questions' } },
                    totalCorrect: { $sum: '$score' }
                }
            }
        ]);

        const topicStats = await QuizAttempt.aggregate([
            { $match: { user: userId } },
            {
                $group: {
                    _id: '$topic',
                    attempts: { $sum: 1 },
                    averageScore: { $avg: '$score' },
                    averagePercentage: { $avg: '$percentage' }
                }
            },
            {
                $lookup: {
                    from: 'topics',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'topic'
                }
            },
            { $unwind: '$topic' },
            {
                $project: {
                    topicName: '$topic.name',
                    attempts: 1,
                    averageScore: 1,
                    averagePercentage: 1
                }
            }
        ]);

        res.status(200).json({
            overall: stats[0] || {
                totalAttempts: 0,
                averageScore: 0,
                averagePercentage: 0,
                highestScore: 0,
                highestPercentage: 0,
                totalQuestions: 0,
                totalCorrect: 0
            },
            byTopic: topicStats
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Get leaderboard
exports.getLeaderboard = async (req, res) => {
    try {
        const { topic, limit = 10 } = req.query;

        let matchStage = {};
        if (topic) {
            matchStage.topic = topic;
        }

        const leaderboard = await QuizAttempt.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: '$user',
                    totalAttempts: { $sum: 1 },
                    averageScore: { $avg: '$score' },
                    averagePercentage: { $avg: '$percentage' },
                    highestScore: { $max: '$score' },
                    highestPercentage: { $max: '$percentage' }
                }
            },
            { $sort: { highestPercentage: -1 } },
            { $limit: parseInt(limit) },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            { $unwind: '$user' },
            {
                $project: {
                    userName: '$user.name',
                    userEmail: '$user.email',
                    totalAttempts: 1,
                    averageScore: 1,
                    averagePercentage: 1,
                    highestScore: 1,
                    highestPercentage: 1
                }
            }
        ]);

        res.status(200).json(leaderboard);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Delete quiz attempt
exports.deleteQuizAttempt = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const quizAttempt = await QuizAttempt.findById(id);

        if (!quizAttempt) {
            return res.status(404).json({ message: 'Quiz attempt not found' });
        }

        // Verify user owns this quiz attempt or is admin
        if (quizAttempt.user.toString() !== userId && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to delete this quiz attempt' });
        }

        await QuizAttempt.findByIdAndDelete(id);

        // Remove from user's quiz history
        await User.findByIdAndUpdate(userId, {
            $pull: { quiz_history: id }
        });

        res.status(200).json({ message: 'Quiz attempt deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
