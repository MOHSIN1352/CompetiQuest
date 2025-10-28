import QuizAttempt from '../Models/QuizModel.js';
import Question from '../Models/QuestionModel.js';
import Topic from '../Models/TopicModel.js';
import User from '../Models/UserModel.js';

// Start a new quiz
export const startQuiz = async (req, res) => {
    try {
        const { topicId, questionCount = 10, difficulty, subjects } = req.body;
        const userId = req.user.id;

        const topic = await Topic.findById(topicId);
        if (!topic) return res.status(404).json({ message: 'Topic not found' });

        let query = {};
        if (difficulty) query.difficulty = difficulty;
        if (subjects && subjects.length > 0) query.subjects = { $in: subjects };

        const questions = await Question.aggregate([
            { $match: query },
            { $sample: { size: parseInt(questionCount) } },
            {
                $project: {
                    correct_option_index: 0 // Hide correct answer in start
                }
            }
        ]);

        if (questions.length === 0) {
            return res.status(404).json({ message: 'No questions found with the specified criteria' });
        }

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
            questions,
            totalQuestions: questions.length
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Submit quiz answers
export const submitQuiz = async (req, res) => {
    try {
        const { quizAttemptId, answers } = req.body;
        const userId = req.user.id;

        const quizAttempt = await QuizAttempt.findById(quizAttemptId)
            .populate('questions.question_id');

        if (!quizAttempt) return res.status(404).json({ message: 'Quiz attempt not found' });

        if (quizAttempt.user.toString() !== userId) {
            return res.status(403).json({ message: 'Not authorized to access this quiz attempt' });
        }

        if (quizAttempt.score > 0) {
            return res.status(400).json({ message: 'Quiz has already been submitted' });
        }

        let correctAnswers = 0;
        const totalQuestions = quizAttempt.questions.length;

        for (let i = 0; i < answers.length; i++) {
            const answer = answers[i];
            const questionData = quizAttempt.questions[i];

            if (questionData.question_id) {
                const isCorrect = answer.selected_option_index === questionData.question_id.correct_option_index;

                questionData.selected_option_index = answer.selected_option_index;
                questionData.is_correct = isCorrect;

                if (isCorrect) correctAnswers++;
            }
        }

        quizAttempt.score = correctAnswers;
        quizAttempt.percentage = (correctAnswers / totalQuestions) * 100;
        await quizAttempt.save();

        await User.findByIdAndUpdate(userId, { $push: { quiz_history: quizAttemptId } });

        res.status(200).json({
            score: correctAnswers,
            percentage: Math.round((correctAnswers / totalQuestions) * 100 * 100) / 100,
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
export const getQuizAttempt = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const quizAttempt = await QuizAttempt.findById(id)
            .populate('user', 'username email')
            .populate('topic', 'name description')
            .populate('questions.question_id');

        if (!quizAttempt) return res.status(404).json({ message: 'Quiz attempt not found' });

        if (quizAttempt.user._id.toString() !== userId && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to access this quiz attempt' });
        }

        res.status(200).json(quizAttempt);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Get user's quiz history
export const getUserQuizHistory = async (req, res) => {
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

// Get all quiz attempts (admin)
export const getAllQuizAttempts = async (req, res) => {
    try {
        const { page = 1, limit = 10, user, topic } = req.query;
        let query = {};
        if (user) query.user = user;
        if (topic) query.topic = topic;

        const quizAttempts = await QuizAttempt.find(query)
            .populate('user', 'username email')
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

// Delete quiz attempt
export const deleteQuizAttempt = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const quizAttempt = await QuizAttempt.findById(id);
        if (!quizAttempt) return res.status(404).json({ message: 'Quiz attempt not found' });

        if (quizAttempt.user.toString() !== userId && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to delete this quiz attempt' });
        }

        await QuizAttempt.findByIdAndDelete(id);
        await User.findByIdAndUpdate(userId, { $pull: { quiz_history: id } });

        res.status(200).json({ message: 'Quiz attempt deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Get user quiz statistics
export const getUserQuizStats = async (req, res) => {
    try {
        const userId = req.user.id;

        const quizAttempts = await QuizAttempt.find({ user: userId });

        if (quizAttempts.length === 0) {
            return res.status(200).json({
                totalAttempts: 0,
                averageScore: 0,
                averagePercentage: 0,
                bestScore: 0,
                bestPercentage: 0
            });
        }

        const totalAttempts = quizAttempts.length;
        const totalScore = quizAttempts.reduce((sum, attempt) => sum + attempt.score, 0);
        const totalPercentage = quizAttempts.reduce((sum, attempt) => sum + attempt.percentage, 0);
        const bestScore = Math.max(...quizAttempts.map(attempt => attempt.score));
        const bestPercentage = Math.max(...quizAttempts.map(attempt => attempt.percentage));

        res.status(200).json({
            totalAttempts,
            averageScore: Math.round((totalScore / totalAttempts) * 100) / 100,
            averagePercentage: Math.round((totalPercentage / totalAttempts) * 100) / 100,
            bestScore,
            bestPercentage: Math.round(bestPercentage * 100) / 100
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Get leaderboard
export const getLeaderboard = async (req, res) => {
    try {
        const { limit = 10, topicId } = req.query;
        let matchQuery = {};

        if (topicId) {
            matchQuery.topic = topicId;
        }

        const leaderboard = await QuizAttempt.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: '$user',
                    totalAttempts: { $sum: 1 },
                    averageScore: { $avg: '$score' },
                    averagePercentage: { $avg: '$percentage' },
                    bestScore: { $max: '$score' },
                    bestPercentage: { $max: '$percentage' }
                }
            },
            { $sort: { bestPercentage: -1, averagePercentage: -1 } },
            { $limit: parseInt(limit) },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'userDetails'
                }
            },
            { $unwind: '$userDetails' },
            {
                $project: {
                    _id: 0,
                    userId: '$_id',
                    username: '$userDetails.username',
                    email: '$userDetails.email',
                    totalAttempts: 1,
                    averageScore: { $round: ['$averageScore', 2] },
                    averagePercentage: { $round: ['$averagePercentage', 2] },
                    bestScore: 1,
                    bestPercentage: { $round: ['$bestPercentage', 2] }
                }
            }
        ]);

        res.status(200).json(leaderboard);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
