import { describe, test, expect, beforeEach, jest } from '@jest/globals';

// Mock the models
jest.unstable_mockModule('../../server/Models/QuestionModel.js', () => ({
  default: {
    findOne: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    findByIdAndDelete: jest.fn(),
    countDocuments: jest.fn(),
    aggregate: jest.fn()
  }
}));

jest.unstable_mockModule('../../server/Models/TopicModel.js', () => ({
  default: {
    findById: jest.fn()
  }
}));

// Import mocked modules and controllers dynamically
const { default: Question } = await import('../../server/Models/QuestionModel.js');
const { default: Topic } = await import('../../server/Models/TopicModel.js');
const controllers = await import('../../server/Controllers/QuestionControllers.js');
const {
  createQuestion,
  getAllQuestions,
  getQuestionById,
  getQuestionsByTopicId,
  updateQuestion,
  deleteQuestion,
  getQuestionsByDifficulty,
  getQuestionsBySubject,
  searchQuestions,
  getRandomQuestions
} = controllers;

describe('QuestionControllers', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      query: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    jest.clearAllMocks();
  });

  describe('createQuestion', () => {
    test('should create a question successfully', async () => {
      req.body = {
        questionText: 'What is 2+2?',
        options: ['3', '4', '5', '6'],
        correctOptionIndex: 1,
        difficulty: 'easy',
        topic: '123',
        explanation: 'Basic math'
      };
      Topic.findById.mockResolvedValue({ _id: '123', name: 'Math' });
      Question.findOne.mockResolvedValue(null);
      Question.create.mockResolvedValue({
        _id: '456',
        questionText: 'What is 2+2?',
        options: ['3', '4', '5', '6'],
        correctOptionIndex: 1,
        difficulty: 'easy',
        topic: '123',
        explanation: 'Basic math'
      });

      await createQuestion(req, res);

      expect(Topic.findById).toHaveBeenCalledWith('123');
      expect(Question.findOne).toHaveBeenCalledWith({ questionText: 'What is 2+2?' });
      expect(Question.create).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalled();
    });

    test('should return 400 if required fields are missing', async () => {
      req.body = { questionText: 'What is 2+2?' };

      await createQuestion(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalled();
    });

    test('should return 400 if options array is invalid', async () => {
      req.body = {
        questionText: 'What is 2+2?',
        options: ['3'],
        correctOptionIndex: 0,
        topic: '123'
      };

      await createQuestion(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalled();
    });

    test('should return 400 if correctOptionIndex is invalid', async () => {
      req.body = {
        questionText: 'What is 2+2?',
        options: ['3', '4'],
        correctOptionIndex: 5,
        topic: '123'
      };

      await createQuestion(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalled();
    });

    test('should return 404 if topic not found', async () => {
      req.body = {
        questionText: 'What is 2+2?',
        options: ['3', '4'],
        correctOptionIndex: 1,
        topic: '123'
      };
      Topic.findById.mockResolvedValue(null);

      await createQuestion(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Topic not found with this ID' });
    });

    test('should return 400 if question already exists', async () => {
      req.body = {
        questionText: 'What is 2+2?',
        options: ['3', '4'],
        correctOptionIndex: 1,
        topic: '123'
      };
      Topic.findById.mockResolvedValue({ _id: '123' });
      Question.findOne.mockResolvedValue({ questionText: 'What is 2+2?' });

      await createQuestion(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Question with this text already exists' });
    });

    test('should handle CastError for invalid topic ID', async () => {
      req.body = {
        questionText: 'What is 2+2?',
        options: ['3', '4'],
        correctOptionIndex: 1,
        topic: 'invalid'
      };
      // Simulate CastError thrown when looking up topic
      Topic.findById.mockRejectedValue({ name: 'CastError' });
      Question.findOne.mockResolvedValue(null);
      

      await createQuestion(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid Topic ID format' });
    });

    test('should handle server errors', async () => {
      req.body = {
        questionText: 'What is 2+2?',
        options: ['3', '4'],
        correctOptionIndex: 1,
        topic: '123'
      };
      Topic.findById.mockRejectedValue(new Error('Database error'));

      await createQuestion(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalled();
    });
  });

  describe('getAllQuestions', () => {
    test('should get all questions with pagination', async () => {
      req.query = { page: '1', limit: '10' };
      const mockQuestions = [
        { _id: '1', questionText: 'Question 1' },
        { _id: '2', questionText: 'Question 2' }
      ];
      Question.find.mockReturnValue({
        limit: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockQuestions)
      });
      Question.countDocuments.mockResolvedValue(20);

      await getAllQuestions(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
    });

    test('should filter questions by difficulty', async () => {
      req.query = { difficulty: 'easy', page: '1', limit: '10' };
      const mockQuestions = [{ _id: '1', difficulty: 'easy' }];
      Question.find.mockReturnValue({
        limit: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockQuestions)
      });
      Question.countDocuments.mockResolvedValue(1);

      await getAllQuestions(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
    });

    test('should handle server errors', async () => {
      req.query = {};
      Question.find.mockReturnValue({
        limit: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        sort: jest.fn().mockRejectedValue(new Error('Database error'))
      });

      await getAllQuestions(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalled();
    });
  });

  describe('getQuestionById', () => {
    test('should get question by id successfully', async () => {
      req.params.id = '123';
      const mockQuestion = { _id: '123', questionText: 'Test Question' };
      Question.findById.mockResolvedValue(mockQuestion);

      await getQuestionById(req, res);

      expect(Question.findById).toHaveBeenCalledWith('123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockQuestion);
    });

    test('should return 404 if question not found', async () => {
      req.params.id = '123';
      Question.findById.mockResolvedValue(null);

      await getQuestionById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Question not found' });
    });

    test('should handle server errors', async () => {
      req.params.id = '123';
      Question.findById.mockRejectedValue(new Error('Database error'));

      await getQuestionById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalled();
    });
  });

  describe('getQuestionsByTopicId', () => {
    test('should get questions by topic id successfully', async () => {
      req.params.topicId = '123';
      req.query = { page: '1', limit: '10' };
      const mockTopic = { _id: '123', name: 'Math', description: 'Math topic' };
      const mockQuestions = [{ _id: '1', questionText: 'Question 1' }];
      Topic.findById.mockResolvedValue(mockTopic);
      Question.find.mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue(mockQuestions)
      });
      Question.countDocuments.mockResolvedValue(1);

      await getQuestionsByTopicId(req, res);

      expect(Topic.findById).toHaveBeenCalledWith('123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
    });

    test('should return 404 if topic not found', async () => {
      req.params.topicId = '123';
      Topic.findById.mockResolvedValue(null);

      await getQuestionsByTopicId(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Topic not found' });
    });

    test('should handle CastError for invalid topic ID', async () => {
      req.params.topicId = 'invalid';
      Topic.findById.mockRejectedValue({ name: 'CastError' });

      await getQuestionsByTopicId(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid Topic ID format' });
    });

    test('should handle server errors', async () => {
      req.params.topicId = '123';
      Topic.findById.mockRejectedValue(new Error('Database error'));

      await getQuestionsByTopicId(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalled();
    });
  });

  describe('updateQuestion', () => {
    test('should update question successfully', async () => {
      req.params.id = '123';
      req.body = {
        question_text: 'Updated Question',
        options: ['A', 'B', 'C'],
        correct_option_index: 0
      };
      const mockQuestion = {
        _id: '123',
        questionText: 'Old Question',
        options: ['A', 'B'],
        correctOptionIndex: 1,
        subjects: [],
        difficulty: 'medium',
        save: jest.fn().mockResolvedValue({
          _id: '123',
          questionText: 'Updated Question',
          options: ['A', 'B', 'C'],
          correctOptionIndex: 0
        })
      };
      Question.findById.mockResolvedValue(mockQuestion);
      Question.findOne.mockResolvedValue(null);

      await updateQuestion(req, res);

      expect(Question.findById).toHaveBeenCalledWith('123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
    });

    test('should return 404 if question not found', async () => {
      req.params.id = '123';
      Question.findById.mockResolvedValue(null);

      await updateQuestion(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Question not found' });
    });

    test('should handle server errors', async () => {
      req.params.id = '123';
      Question.findById.mockRejectedValue(new Error('Database error'));

      await updateQuestion(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalled();
    });
  });

  describe('deleteQuestion', () => {
    test('should delete question successfully', async () => {
      req.params.id = '123';
      const mockQuestion = { _id: '123', questionText: 'Test Question' };
      Question.findById.mockResolvedValue(mockQuestion);
      Question.findByIdAndDelete.mockResolvedValue(mockQuestion);

      await deleteQuestion(req, res);

      expect(Question.findById).toHaveBeenCalledWith('123');
      expect(Question.findByIdAndDelete).toHaveBeenCalledWith('123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Question deleted successfully' });
    });

    test('should return 404 if question not found', async () => {
      req.params.id = '123';
      Question.findById.mockResolvedValue(null);

      await deleteQuestion(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Question not found' });
    });

    test('should handle server errors', async () => {
      req.params.id = '123';
      Question.findById.mockRejectedValue(new Error('Database error'));

      await deleteQuestion(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalled();
    });
  });

  describe('getQuestionsByDifficulty', () => {
    test('should get questions by difficulty successfully', async () => {
      req.params.difficulty = 'easy';
      req.query = { page: '1', limit: '10' };
      const mockQuestions = [{ _id: '1', difficulty: 'easy' }];
      Question.find.mockReturnValue({
        limit: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockQuestions)
      });
      Question.countDocuments.mockResolvedValue(1);

      await getQuestionsByDifficulty(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
    });

    test('should return 400 for invalid difficulty', async () => {
      req.params.difficulty = 'invalid';
      req.query = {};

      await getQuestionsByDifficulty(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid difficulty level' });
    });

    test('should handle server errors', async () => {
      req.params.difficulty = 'easy';
      Question.find.mockReturnValue({
        limit: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        sort: jest.fn().mockRejectedValue(new Error('Database error'))
      });

      await getQuestionsByDifficulty(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalled();
    });
  });

  describe('getQuestionsBySubject', () => {
    test('should get questions by subject successfully', async () => {
      req.params.subject = 'Math';
      req.query = { page: '1', limit: '10' };
      const mockQuestions = [{ _id: '1', subjects: ['Math'] }];
      Question.find.mockReturnValue({
        limit: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockQuestions)
      });
      Question.countDocuments.mockResolvedValue(1);

      await getQuestionsBySubject(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
    });

    test('should handle server errors', async () => {
      req.params.subject = 'Math';
      Question.find.mockReturnValue({
        limit: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        sort: jest.fn().mockRejectedValue(new Error('Database error'))
      });

      await getQuestionsBySubject(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalled();
    });
  });

  describe('searchQuestions', () => {
    test('should search questions successfully', async () => {
      req.query = { q: 'math' };
      const mockQuestions = [{ _id: '1', questionText: 'Math question' }];
      Question.find.mockReturnValue({
        limit: jest.fn().mockResolvedValue(mockQuestions)
      });

      await searchQuestions(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockQuestions);
    });

    test('should return 400 if search query is missing', async () => {
      req.query = {};

      await searchQuestions(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Search query is required' });
    });

    test('should handle server errors', async () => {
      req.query = { q: 'math' };
      Question.find.mockReturnValue({
        limit: jest.fn().mockRejectedValue(new Error('Database error'))
      });

      await searchQuestions(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalled();
    });
  });

  describe('getRandomQuestions', () => {
    test('should get random questions successfully', async () => {
      req.query = { count: '5', difficulty: 'easy' };
      const mockQuestions = [{ _id: '1', difficulty: 'easy' }];
      Question.aggregate.mockResolvedValue(mockQuestions);

      await getRandomQuestions(req, res);

      expect(Question.aggregate).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockQuestions);
    });

    test('should handle server errors', async () => {
      req.query = { count: '5' };
      Question.aggregate.mockRejectedValue(new Error('Database error'));

      await getRandomQuestions(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalled();
    });
  });
});

