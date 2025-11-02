import QuizAttempt from '../Models/QuizModel.js';
import Question from '../Models/QuestionModel.js';
import Topic from '../Models/TopicModel.js';
import User from '../Models/UserModel.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import mongoose from 'mongoose';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'AIzaSyCG0ePJM6-MqxblV3HFyDVnbmG-c35O04Q');

// Generate quiz and save to database
export const generateQuiz = async (req, res) => {
    try {
        const { userId, topic, numberOfQuestions, level } = req.body;

        if (!userId) return res.status(400).json({ success: false, message: 'userId is required' });
        if (!topic) return res.status(400).json({ success: false, message: 'topic is required' });
        
        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ success: false, message: 'Invalid userId format' });
        }
        
        let count = parseInt(numberOfQuestions, 10) || 5;
        if (count <= 0) count = 5;
        if (count > 20) count = 20;

        const difficulty = (level || 'medium').toLowerCase();

        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        
        const prompt = `Generate ${count} multiple choice questions about ${topic} at ${difficulty} difficulty level. 
        Return ONLY a valid JSON array with this exact format:
        [
          {
            "id": 1,
            "description": "Question text here?",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correctOption": 0
          }
        ]
        Make sure correctOption is the index (0-3) of the correct answer in the options array.`;
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        let cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const questions = JSON.parse(cleanedText);

        // Store quiz attempt in database immediately
        const quizAttempt = await QuizAttempt.create({
            user: userId,
            topic: { name: topic, description: `${difficulty} level ${topic} quiz` },
            questions: questions.map(q => ({
                question_data: {
                    description: q.description,
                    options: q.options,
                    correct_option_index: q.correctOption
                },
                selected_option_index: null,
                is_correct: null
            })),
            score: 0,
            percentage: 0,
            status: 'in_progress'
        });

        // Return questions WITHOUT correct answers (secure)
        const questionsForUser = questions.map(q => ({
            id: q.id,
            description: q.description,
            options: q.options
        }));

        res.status(200).json({ 
            success: true, 
            quizAttemptId: quizAttempt._id,
            questions: questionsForUser,
            message: `Generated ${questions.length} ${difficulty} level questions about ${topic}`
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Error generating quiz', 
            error: error.message 
        });
    }
};

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

// Submit quiz answers - Update stored attempt with results
export const submitQuiz = async (req, res) => {
    try {
        const { quizAttemptId, answers } = req.body;

        const quizAttempt = await QuizAttempt.findById(quizAttemptId);
        if (!quizAttempt) return res.status(404).json({ success: false, message: 'Quiz attempt not found' });

        if (quizAttempt.status === 'completed') {
            return res.status(400).json({ success: false, message: 'Quiz already submitted' });
        }

        let correctAnswers = 0;
        const totalQuestions = quizAttempt.questions.length;

        // Calculate results and update questions
        for (let i = 0; i < answers.length; i++) {
            const userAnswer = answers[i];
            const questionData = quizAttempt.questions[i];

            const isCorrect = userAnswer.selectedOption === questionData.question_data.correct_option_index;

            questionData.selected_option_index = userAnswer.selectedOption;
            questionData.is_correct = isCorrect;

            if (isCorrect) correctAnswers++;
        }

        // Update quiz attempt with final results
        quizAttempt.score = correctAnswers;
        quizAttempt.percentage = (correctAnswers / totalQuestions) * 100;
        quizAttempt.status = 'completed';
        quizAttempt.completed_at = new Date();
        await quizAttempt.save();

        // Results now stored in user profile!
        res.status(200).json({
            success: true,
            score: correctAnswers,
            percentage: Math.round((correctAnswers / totalQuestions) * 100 * 100) / 100,
            totalQuestions,
            results: quizAttempt.questions.map((q, index) => ({
                question: q.question_data.description,
                options: q.question_data.options,
                userAnswer: q.selected_option_index,
                correctAnswer: q.question_data.correct_option_index,
                isCorrect: q.is_correct
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
        const { userId } = req.params;
        const { page = 1, limit = 10 } = req.query;

        const quizAttempts = await QuizAttempt.find({ user: userId })
            .sort({ attempted_at: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await QuizAttempt.countDocuments({ user: userId });

        const formattedAttempts = quizAttempts.map(attempt => ({
            _id: attempt._id,
            topic: attempt.topic.name || attempt.topic,
            score: attempt.score,
            percentage: attempt.percentage,
            totalQuestions: attempt.questions.length,
            status: attempt.status,
            attempted_at: attempt.attempted_at,
            completed_at: attempt.completed_at
        }));

        res.status(200).json({
            success: true,
            quizAttempts: formattedAttempts,
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
