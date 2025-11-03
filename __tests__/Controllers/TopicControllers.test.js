import { describe, test, expect, beforeEach, jest } from '@jest/globals';

// Mock the model
jest.unstable_mockModule('../../Models/TopicModel.js', () => ({
  default: {
    findOne: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    findByIdAndDelete: jest.fn(),
    countDocuments: jest.fn()
  }
}));

// Import mocked module and controllers dynamically
const { default: Topic } = await import('../../Models/TopicModel.js');
const controllers = await import('../../Controllers/TopicControllers.js');
const {
  createTopic,
  getAllTopics,
  getTopicById,
  getTopicsByCategoryId,
  updateTopic,
  deleteTopic,
  addSubjectToTopic,
  removeSubjectFromTopic,
  getAllSubjects,
  searchTopics
} = controllers;

describe('TopicControllers', () => {
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

  describe('createTopic', () => {
    test('should create a topic successfully', async () => {
      req.body = {
        name: 'Test Topic',
        description: 'Test Description',
        subjects: ['Math', 'Science'],
        category: '123'
      };
      Topic.findOne.mockResolvedValue(null);
      Topic.create.mockResolvedValue({
        _id: '456',
        name: 'Test Topic',
        description: 'Test Description',
        subjects: ['Math', 'Science'],
        category: '123'
      });

      await createTopic(req, res);

      expect(Topic.findOne).toHaveBeenCalledWith({ name: 'Test Topic' });
      expect(Topic.create).toHaveBeenCalledWith({
        name: 'Test Topic',
        description: 'Test Description',
        subjects: ['Math', 'Science'],
        category: '123'
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalled();
    });

    test('should return 400 if name is missing', async () => {
      req.body = { description: 'Test Description', category: '123' };

      await createTopic(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Topic name is required' });
    });

    test('should return 400 if category is missing', async () => {
      req.body = { name: 'Test Topic' };

      await createTopic(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Category ID is required to create a topic'
      });
    });

    test('should return 400 if topic already exists', async () => {
      req.body = { name: 'Test Topic', category: '123' };
      Topic.findOne.mockResolvedValue({ name: 'Test Topic' });

      await createTopic(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Topic with this name already exists'
      });
    });

    test('should handle server errors', async () => {
      req.body = { name: 'Test Topic', category: '123' };
      Topic.findOne.mockRejectedValue(new Error('Database error'));

      await createTopic(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalled();
    });
  });

  describe('getAllTopics', () => {
    test('should get all topics with pagination', async () => {
      req.query = { page: '1', limit: '10' };
      const mockTopics = [
        { _id: '1', name: 'Topic 1' },
        { _id: '2', name: 'Topic 2' }
      ];
      Topic.find.mockReturnValue({
        limit: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockTopics)
      });
      Topic.countDocuments.mockResolvedValue(20);

      await getAllTopics(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
    });

    test('should filter topics by search query', async () => {
      req.query = { page: '1', limit: '10', search: 'math' };
      const mockTopics = [{ _id: '1', name: 'Math Topic' }];
      Topic.find.mockReturnValue({
        limit: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockTopics)
      });
      Topic.countDocuments.mockResolvedValue(1);

      await getAllTopics(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
    });

    test('should filter topics by subject', async () => {
      req.query = { page: '1', limit: '10', subject: 'Math' };
      const mockTopics = [{ _id: '1', subjects: ['Math'] }];
      Topic.find.mockReturnValue({
        limit: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockTopics)
      });
      Topic.countDocuments.mockResolvedValue(1);

      await getAllTopics(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
    });

    test('should handle server errors', async () => {
      req.query = {};
      Topic.find.mockReturnValue({
        limit: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        sort: jest.fn().mockRejectedValue(new Error('Database error'))
      });

      await getAllTopics(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalled();
    });
  });

  describe('getTopicById', () => {
    test('should get topic by id successfully', async () => {
      req.params.id = '123';
      const mockTopic = { _id: '123', name: 'Test Topic' };
      Topic.findById.mockResolvedValue(mockTopic);

      await getTopicById(req, res);

      expect(Topic.findById).toHaveBeenCalledWith('123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockTopic);
    });

    test('should return 404 if topic not found', async () => {
      req.params.id = '123';
      Topic.findById.mockResolvedValue(null);

      await getTopicById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Topic not found' });
    });

    test('should handle server errors', async () => {
      req.params.id = '123';
      Topic.findById.mockRejectedValue(new Error('Database error'));

      await getTopicById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalled();
    });
  });

  describe('getTopicsByCategoryId', () => {
    test('should get topics by category id successfully', async () => {
      req.params.categoryId = '123';
      const mockTopics = [
        { _id: '1', name: 'Topic 1', category: '123' },
        { _id: '2', name: 'Topic 2', category: '123' }
      ];
      Topic.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockTopics)
      });

      await getTopicsByCategoryId(req, res);

      expect(Topic.find).toHaveBeenCalledWith({ category: '123' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockTopics);
    });

    test('should return 400 if categoryId is missing', async () => {
      req.params.categoryId = undefined;

      await getTopicsByCategoryId(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Category ID is required' });
    });

    test('should return empty array if no topics found', async () => {
      req.params.categoryId = '123';
      Topic.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue([])
      });

      await getTopicsByCategoryId(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([]);
    });

    test('should handle CastError for invalid category ID', async () => {
      req.params.categoryId = 'invalid';
      Topic.find.mockReturnValue({
        sort: jest.fn().mockRejectedValue({ name: 'CastError' })
      });

      await getTopicsByCategoryId(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid Category ID format' });
    });

    test('should handle server errors', async () => {
      req.params.categoryId = '123';
      Topic.find.mockReturnValue({
        sort: jest.fn().mockRejectedValue(new Error('Database error'))
      });

      await getTopicsByCategoryId(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalled();
    });
  });

  describe('updateTopic', () => {
    test('should update topic successfully', async () => {
      req.params.id = '123';
      req.body = {
        name: 'Updated Topic',
        description: 'Updated Description',
        subjects: ['Math', 'Physics']
      };
      const mockTopic = {
        _id: '123',
        name: 'Old Topic',
        description: 'Old Description',
        subjects: ['Math'],
        save: jest.fn().mockResolvedValue({
          _id: '123',
          name: 'Updated Topic',
          description: 'Updated Description',
          subjects: ['Math', 'Physics']
        })
      };
      Topic.findById.mockResolvedValue(mockTopic);
      Topic.findOne.mockResolvedValue(null);

      await updateTopic(req, res);

      expect(Topic.findById).toHaveBeenCalledWith('123');
      expect(mockTopic.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
    });

    test('should return 404 if topic not found', async () => {
      req.params.id = '123';
      Topic.findById.mockResolvedValue(null);

      await updateTopic(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Topic not found' });
    });

    test('should return 400 if new name already exists', async () => {
      req.params.id = '123';
      req.body = { name: 'Existing Topic' };
      const mockTopic = {
        _id: '123',
        name: 'Old Topic',
        save: jest.fn()
      };
      Topic.findById.mockResolvedValue(mockTopic);
      Topic.findOne.mockResolvedValue({ _id: '456', name: 'Existing Topic' });

      await updateTopic(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Topic with this name already exists'
      });
    });

    test('should handle server errors', async () => {
      req.params.id = '123';
      Topic.findById.mockRejectedValue(new Error('Database error'));

      await updateTopic(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalled();
    });
  });

  describe('deleteTopic', () => {
    test('should delete topic successfully', async () => {
      req.params.id = '123';
      const mockTopic = { _id: '123', name: 'Test Topic' };
      Topic.findById.mockResolvedValue(mockTopic);
      Topic.findByIdAndDelete.mockResolvedValue(mockTopic);

      await deleteTopic(req, res);

      expect(Topic.findById).toHaveBeenCalledWith('123');
      expect(Topic.findByIdAndDelete).toHaveBeenCalledWith('123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Topic deleted successfully' });
    });

    test('should return 404 if topic not found', async () => {
      req.params.id = '123';
      Topic.findById.mockResolvedValue(null);

      await deleteTopic(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Topic not found' });
    });

    test('should handle server errors', async () => {
      req.params.id = '123';
      Topic.findById.mockRejectedValue(new Error('Database error'));

      await deleteTopic(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalled();
    });
  });

  describe('addSubjectToTopic', () => {
    test('should add subject to topic successfully', async () => {
      req.params.id = '123';
      req.body = { subject: 'Physics' };
      const mockTopic = {
        _id: '123',
        subjects: ['Math'],
        save: jest.fn().mockResolvedValue({ _id: '123', subjects: ['Math', 'Physics'] })
      };
      Topic.findById.mockResolvedValue(mockTopic);

      await addSubjectToTopic(req, res);

      expect(Topic.findById).toHaveBeenCalledWith('123');
      expect(mockTopic.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
    });

    test('should return 404 if topic not found', async () => {
      req.params.id = '123';
      req.body = { subject: 'Physics' };
      Topic.findById.mockResolvedValue(null);

      await addSubjectToTopic(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Topic not found' });
    });

    test('should return 400 if subject is missing', async () => {
      req.params.id = '123';
      req.body = {};
      const mockTopic = { _id: '123', subjects: [] };
      Topic.findById.mockResolvedValue(mockTopic);

      await addSubjectToTopic(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Subject is required' });
    });

    test('should return 400 if subject already exists', async () => {
      req.params.id = '123';
      req.body = { subject: 'Math' };
      const mockTopic = {
        _id: '123',
        subjects: ['Math'],
        includes: jest.fn().mockReturnValue(true)
      };
      Topic.findById.mockResolvedValue(mockTopic);

      await addSubjectToTopic(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Subject already exists in this topic'
      });
    });

    test('should handle server errors', async () => {
      req.params.id = '123';
      req.body = { subject: 'Physics' };
      Topic.findById.mockRejectedValue(new Error('Database error'));

      await addSubjectToTopic(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalled();
    });
  });

  describe('removeSubjectFromTopic', () => {
    test('should remove subject from topic successfully', async () => {
      req.params.id = '123';
      req.body = { subject: 'Math' };
      const mockTopic = {
        _id: '123',
        subjects: ['Math', 'Physics'],
        filter: jest.fn().mockReturnValue(['Physics']),
        save: jest.fn().mockResolvedValue({
          _id: '123',
          subjects: ['Physics']
        })
      };
      Topic.findById.mockResolvedValue(mockTopic);

      await removeSubjectFromTopic(req, res);

      expect(Topic.findById).toHaveBeenCalledWith('123');
      expect(mockTopic.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
    });

    test('should return 404 if topic not found', async () => {
      req.params.id = '123';
      req.body = { subject: 'Math' };
      Topic.findById.mockResolvedValue(null);

      await removeSubjectFromTopic(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Topic not found' });
    });

    test('should return 400 if subject is missing', async () => {
      req.params.id = '123';
      req.body = {};
      const mockTopic = { _id: '123', subjects: ['Math'] };
      Topic.findById.mockResolvedValue(mockTopic);

      await removeSubjectFromTopic(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Subject is required' });
    });

    test('should handle server errors', async () => {
      req.params.id = '123';
      req.body = { subject: 'Math' };
      Topic.findById.mockRejectedValue(new Error('Database error'));

      await removeSubjectFromTopic(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalled();
    });
  });

  describe('getAllSubjects', () => {
    test('should get all unique subjects successfully', async () => {
      const mockTopics = [
        { subjects: ['Math', 'Science'] },
        { subjects: ['Math', 'Physics'] },
        { subjects: ['Chemistry'] }
      ];
      Topic.find.mockResolvedValue(mockTopics);

      await getAllSubjects(req, res);

      expect(Topic.find).toHaveBeenCalledWith({});
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
    });

    test('should handle server errors', async () => {
      Topic.find.mockRejectedValue(new Error('Database error'));

      await getAllSubjects(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalled();
    });
  });

  describe('searchTopics', () => {
    test('should search topics successfully', async () => {
      req.query = { q: 'math' };
      const mockTopics = [{ _id: '1', name: 'Math Topic' }];
      Topic.find.mockReturnValue({
        limit: jest.fn().mockResolvedValue(mockTopics)
      });

      await searchTopics(req, res);

      expect(Topic.find).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockTopics);
    });

    test('should return 400 if search query is missing', async () => {
      req.query = {};

      await searchTopics(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Search query is required' });
    });

    test('should handle server errors', async () => {
      req.query = { q: 'math' };
      Topic.find.mockReturnValue({
        limit: jest.fn().mockRejectedValue(new Error('Database error'))
      });

      await searchTopics(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalled();
    });
  });
});

