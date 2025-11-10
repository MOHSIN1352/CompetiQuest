import { describe, test, expect, beforeEach, jest } from '@jest/globals';

// Mock the models
jest.unstable_mockModule('../../Models/QuizModel.js', () => ({
  default: {
    findById: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    findByIdAndDelete: jest.fn(),
    aggregate: jest.fn(),
    countDocuments: jest.fn()
  }
}));

jest.unstable_mockModule('../../Models/QuestionModel.js', () => ({
  default: {
    aggregate: jest.fn()
  }
}));

jest.unstable_mockModule('../../Models/TopicModel.js', () => ({
  default: {
    findById: jest.fn()
  }
}));

jest.unstable_mockModule('../../Models/UserModel.js', () => ({
  default: {
    findByIdAndUpdate: jest.fn()
  }
}));

// Import mocked modules and controllers dynamically
const { default: QuizAttempt } = await import('../../Models/QuizModel.js');
const { default: Question } = await import('../../Models/QuestionModel.js');
const { default: Topic } = await import('../../Models/TopicModel.js');
const { default: User } = await import('../../Models/UserModel.js');
const controllers = await import('../../Controllers/QuizControllers.js');
const {
  startQuiz,
  submitQuiz,
  getQuizAttempt,
  getUserQuizHistory,
  getAllQuizAttempts,
  deleteQuizAttempt,
  getUserQuizStats,
  getLeaderboard
} = controllers;

describe('QuizControllers', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      query: {},
      user: { id: 'user123', role: 'user' }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    jest.clearAllMocks();
  });

  describe('startQuiz', () => {
    test('should start quiz successfully', async () => {
      req.body = {
        topicId: '123',
        questionCount: 10,
        difficulty: 'easy'
      };
      const mockTopic = { _id: '123', name: 'Math Topic' };
      const mockQuestions = [
        { _id: '1', questionText: 'Question 1', options: ['A', 'B'] },
        { _id: '2', questionText: 'Question 2', options: ['A', 'B'] }
      ];
      Topic.findById.mockResolvedValue(mockTopic);
      Question.aggregate.mockResolvedValue(mockQuestions);
      QuizAttempt.create.mockResolvedValue({
        _id: 'quiz123',
        user: 'user123',
        topic: '123',
        questions: [],
        score: 0,
        percentage: 0
      });

      await startQuiz(req, res);

      expect(Topic.findById).toHaveBeenCalledWith('123');
      expect(Question.aggregate).toHaveBeenCalled();
      expect(QuizAttempt.create).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalled();
    });

    test('should return 404 if topic not found', async () => {
      req.body = { topicId: '123' };
      Topic.findById.mockResolvedValue(null);

      await startQuiz(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Topic not found' });
    });

    test('should return 404 if no questions found', async () => {
      req.body = { topicId: '123', questionCount: 10 };
      const mockTopic = { _id: '123', name: 'Math Topic' };
      Topic.findById.mockResolvedValue(mockTopic);
      Question.aggregate.mockResolvedValue([]);

      await startQuiz(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'No questions found with the specified criteria'
      });
    });

    test('should handle server errors', async () => {
      req.body = { topicId: '123' };
      Topic.findById.mockRejectedValue(new Error('Database error'));

      await startQuiz(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalled();
    });
  });

  describe('submitQuiz', () => {
    test('should submit quiz successfully', async () => {
      req.body = {
        quizAttemptId: 'quiz123',
        answers: [
          { selectedOption: 0 },
          { selectedOption: 1 }
        ]
      };
      const mockQuizAttempt = {
        _id: 'quiz123',
        user: 'user123',
        questions: [
          {
            question_data: { correct_option_index: 0 },
            selected_option_index: null,
            is_correct: null
          },
          {
            question_data: { correct_option_index: 1 },
            selected_option_index: null,
            is_correct: null
          }
        ],
        score: 0,
        percentage: 0,
        status: 'in_progress',
        save: jest.fn().mockResolvedValue(true)
      };
      QuizAttempt.findById.mockResolvedValue(mockQuizAttempt);

      await submitQuiz(req, res);

      expect(QuizAttempt.findById).toHaveBeenCalledWith('quiz123');
      expect(mockQuizAttempt.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
    });

    test('should return 404 if quiz attempt not found', async () => {
      req.body = { quizAttemptId: 'quiz123', answers: [] };
      QuizAttempt.findById.mockResolvedValue(null);

      await submitQuiz(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Quiz attempt not found' });
    });

    test('should return 400 if quiz already submitted', async () => {
      req.body = { quizAttemptId: 'quiz123', answers: [] };
      const mockQuizAttempt = {
        _id: 'quiz123',
        user: 'user123',
        status: 'completed'
      };
      QuizAttempt.findById.mockResolvedValue(mockQuizAttempt);

      await submitQuiz(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Quiz already submitted' });
    });



    test('should handle server errors', async () => {
      req.body = { quizAttemptId: 'quiz123', answers: [] };
      QuizAttempt.findById.mockRejectedValue(new Error('Database error'));

      await submitQuiz(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalled();
    });
  });

  describe('getQuizAttempt', () => {
    test('should get quiz attempt successfully', async () => {
      req.params.id = 'quiz123';
      const mockQuizAttempt = {
        _id: 'quiz123',
        user: { _id: 'user123', username: 'testuser' },
        topic: { _id: '123', name: 'Math' }
      };
      const populateChain = {
        populate: jest.fn().mockReturnThis(),
        then: (resolve) => Promise.resolve(resolve(mockQuizAttempt))
      };
      QuizAttempt.findById.mockReturnValue(populateChain);

      await getQuizAttempt(req, res);

      expect(QuizAttempt.findById).toHaveBeenCalledWith('quiz123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
    });

    test('should return 404 if quiz attempt not found', async () => {
      req.params.id = 'quiz123';
      const populateChain = {
        populate: jest.fn().mockReturnThis(),
        then: (resolve) => Promise.resolve(resolve(null))
      };
      QuizAttempt.findById.mockReturnValue(populateChain);

      await getQuizAttempt(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Quiz attempt not found' });
    });

    test('should return 403 if not authorized', async () => {
      req.params.id = 'quiz123';
      req.user.role = 'user';
      const mockQuizAttempt = {
        _id: 'quiz123',
        user: { _id: { toString: () => 'otherUser' } }
      };
      const populateChain = {
        populate: jest.fn().mockReturnThis(),
        then: (resolve) => Promise.resolve(resolve(mockQuizAttempt))
      };
      QuizAttempt.findById.mockReturnValue(populateChain);

      await getQuizAttempt(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Not authorized to access this quiz attempt'
      });
    });

    test('should handle server errors', async () => {
      req.params.id = 'quiz123';
      // Simulate an unexpected error thrown during DB call
      QuizAttempt.findById.mockImplementation(() => { throw new Error('Database error'); });

      await getQuizAttempt(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalled();
    });
  });

  describe('getUserQuizHistory', () => {
    test('should get user quiz history successfully', async () => {
      req.params.userId = 'user123';
      req.query = { page: '1', limit: '10' };
      const mockQuizAttempts = [
        { _id: '1', score: 8, percentage: 80, topic: { name: 'Math' }, questions: [1,2,3], status: 'completed', attempted_at: new Date() },
        { _id: '2', score: 7, percentage: 70, topic: { name: 'Science' }, questions: [1,2,3], status: 'completed', attempted_at: new Date() }
      ];
      QuizAttempt.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        skip: jest.fn().mockResolvedValue(mockQuizAttempts)
      });
      QuizAttempt.countDocuments.mockResolvedValue(2);

      await getUserQuizHistory(req, res);

      expect(QuizAttempt.find).toHaveBeenCalledWith({ user: 'user123' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
    });

    test('should handle server errors', async () => {
      req.query = {};
      QuizAttempt.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        skip: jest.fn().mockRejectedValue(new Error('Database error'))
      });

      await getUserQuizHistory(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalled();
    });
  });

  describe('getAllQuizAttempts', () => {
    test('should get all quiz attempts successfully', async () => {
      req.query = { page: '1', limit: '10' };
      const mockQuizAttempts = [{ _id: '1', score: 8 }];
      QuizAttempt.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        skip: jest.fn().mockResolvedValue(mockQuizAttempts)
      });
      QuizAttempt.countDocuments.mockResolvedValue(1);

      await getAllQuizAttempts(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
    });

    test('should filter by user and topic', async () => {
      req.query = { user: 'user123', topic: '123', page: '1', limit: '10' };
      const mockQuizAttempts = [{ _id: '1' }];
      QuizAttempt.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        skip: jest.fn().mockResolvedValue(mockQuizAttempts)
      });
      QuizAttempt.countDocuments.mockResolvedValue(1);

      await getAllQuizAttempts(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
    });

    test('should handle server errors', async () => {
      req.query = {};
      QuizAttempt.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        skip: jest.fn().mockRejectedValue(new Error('Database error'))
      });

      await getAllQuizAttempts(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalled();
    });
  });

  describe('deleteQuizAttempt', () => {
    test('should delete quiz attempt successfully', async () => {
      req.params.id = 'quiz123';
      const mockQuizAttempt = {
        _id: 'quiz123',
        user: { toString: () => 'user123' }
      };
      QuizAttempt.findById.mockResolvedValue(mockQuizAttempt);
      QuizAttempt.findByIdAndDelete.mockResolvedValue(mockQuizAttempt);
      User.findByIdAndUpdate.mockResolvedValue({});

      await deleteQuizAttempt(req, res);

      expect(QuizAttempt.findById).toHaveBeenCalledWith('quiz123');
      expect(QuizAttempt.findByIdAndDelete).toHaveBeenCalledWith('quiz123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Quiz attempt deleted successfully'
      });
    });

    test('should return 404 if quiz attempt not found', async () => {
      req.params.id = 'quiz123';
      QuizAttempt.findById.mockResolvedValue(null);

      await deleteQuizAttempt(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Quiz attempt not found' });
    });

    test('should return 403 if not authorized', async () => {
      req.params.id = 'quiz123';
      req.user.role = 'user';
      const mockQuizAttempt = {
        _id: 'quiz123',
        user: { toString: () => 'otherUser' }
      };
      QuizAttempt.findById.mockResolvedValue(mockQuizAttempt);

      await deleteQuizAttempt(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Not authorized to delete this quiz attempt'
      });
    });

    test('should handle server errors', async () => {
      req.params.id = 'quiz123';
      QuizAttempt.findById.mockRejectedValue(new Error('Database error'));

      await deleteQuizAttempt(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalled();
    });
  });

  describe('getUserQuizStats', () => {
    test('should get user quiz stats successfully', async () => {
      const mockQuizAttempts = [
        { score: 8, percentage: 80 },
        { score: 7, percentage: 70 },
        { score: 9, percentage: 90 }
      ];
      QuizAttempt.find.mockResolvedValue(mockQuizAttempts);

      await getUserQuizStats(req, res);

      expect(QuizAttempt.find).toHaveBeenCalledWith({ user: 'user123' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
    });

    test('should return empty stats if no quiz attempts', async () => {
      QuizAttempt.find.mockResolvedValue([]);

      await getUserQuizStats(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        totalAttempts: 0,
        averageScore: 0,
        averagePercentage: 0,
        bestScore: 0,
        bestPercentage: 0
      });
    });

    test('should handle server errors', async () => {
      QuizAttempt.find.mockRejectedValue(new Error('Database error'));

      await getUserQuizStats(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalled();
    });
  });

  describe('getLeaderboard', () => {
    test('should get leaderboard successfully', async () => {
      req.query = { limit: '10' };
      const mockLeaderboard = [
        {
          userId: 'user1',
          username: 'user1',
          averageScore: 8.5,
          bestPercentage: 90
        }
      ];
      QuizAttempt.aggregate.mockResolvedValue(mockLeaderboard);

      await getLeaderboard(req, res);

      expect(QuizAttempt.aggregate).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockLeaderboard);
    });

    test('should filter leaderboard by topic', async () => {
      req.query = { limit: '10', topicId: '123' };
      const mockLeaderboard = [];
      QuizAttempt.aggregate.mockResolvedValue(mockLeaderboard);

      await getLeaderboard(req, res);

      expect(QuizAttempt.aggregate).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
    });

    test('should handle server errors', async () => {
      req.query = { limit: '10' };
      QuizAttempt.aggregate.mockRejectedValue(new Error('Database error'));

      await getLeaderboard(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalled();
    });
  });
});

