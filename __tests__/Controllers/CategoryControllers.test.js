import { describe, test, expect, beforeEach, jest } from '@jest/globals';

// Mock the models
jest.unstable_mockModule('../../Models/CategoryModel.js', () => ({
  default: {
    findOne: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    findByIdAndDelete: jest.fn()
  }
}));

jest.unstable_mockModule('../../Models/TopicModel.js', () => ({
  default: {
    findById: jest.fn()
  }
}));

// Import mocked modules
const { default: Category } = await import('../../Models/CategoryModel.js');
const { default: Topic } = await import('../../Models/TopicModel.js');
const controllers = await import('../../Controllers/CategoryControllers.js');
const {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  addTopicToCategory,
  removeTopicFromCategory
} = controllers;

describe('CategoryControllers', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      params: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    jest.clearAllMocks();
  });

  describe('createCategory', () => {
    test('should create a category successfully', async () => {
      req.body = { name: 'Test Category', description: 'Test Description' };
      Category.findOne.mockResolvedValue(null);
      Category.create.mockResolvedValue({
        _id: '123',
        name: 'Test Category',
        description: 'Test Description'
      });

      await createCategory(req, res);

      expect(Category.findOne).toHaveBeenCalledWith({ name: 'Test Category' });
      expect(Category.create).toHaveBeenCalledWith({
        name: 'Test Category',
        description: 'Test Description'
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalled();
    });

    test('should return 400 if name is missing', async () => {
      req.body = { description: 'Test Description' };

      await createCategory(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Category name is required' });
    });

    test('should return 400 if category already exists', async () => {
      req.body = { name: 'Test Category' };
      Category.findOne.mockResolvedValue({ name: 'Test Category' });

      await createCategory(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Category already exists' });
    });

    test('should handle server errors', async () => {
      req.body = { name: 'Test Category' };
      Category.findOne.mockRejectedValue(new Error('Database error'));

      await createCategory(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalled();
    });
  });

  describe('getAllCategories', () => {
    test('should get all categories successfully', async () => {
      const mockCategories = [
        { _id: '1', name: 'Category 1' },
        { _id: '2', name: 'Category 2' }
      ];
      Category.find.mockResolvedValue(mockCategories);

      await getAllCategories(req, res);

      expect(Category.find).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockCategories);
    });

    test('should handle server errors', async () => {
      Category.find.mockRejectedValue(new Error('Database error'));

      await getAllCategories(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalled();
    });
  });

  describe('getCategoryById', () => {
    test('should get category by id successfully', async () => {
      req.params.id = '123';
      const mockCategory = { _id: '123', name: 'Test Category' };
      Category.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockCategory)
      });

      await getCategoryById(req, res);

      expect(Category.findById).toHaveBeenCalledWith('123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockCategory);
    });

    test('should return 404 if category not found', async () => {
      req.params.id = '123';
      Category.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null)
      });

      await getCategoryById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Category not found' });
    });

    test('should handle server errors', async () => {
      req.params.id = '123';
      Category.findById.mockReturnValue({
        populate: jest.fn().mockRejectedValue(new Error('Database error'))
      });

      await getCategoryById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalled();
    });
  });

  describe('updateCategory', () => {
    test('should update category successfully', async () => {
      req.params.id = '123';
      req.body = { name: 'Updated Category', description: 'Updated Description' };
      const mockCategory = {
        _id: '123',
        name: 'Old Category',
        description: 'Old Description',
        save: jest.fn().mockResolvedValue({
          _id: '123',
          name: 'Updated Category',
          description: 'Updated Description'
        })
      };
      Category.findById.mockResolvedValue(mockCategory);
      Category.findOne.mockResolvedValue(null);

      await updateCategory(req, res);

      expect(Category.findById).toHaveBeenCalledWith('123');
      expect(mockCategory.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
    });

    test('should return 404 if category not found', async () => {
      req.params.id = '123';
      Category.findById.mockResolvedValue(null);

      await updateCategory(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Category not found' });
    });

    test('should return 400 if new name already exists', async () => {
      req.params.id = '123';
      req.body = { name: 'Existing Category' };
      const mockCategory = {
        _id: '123',
        name: 'Old Category',
        save: jest.fn()
      };
      Category.findById.mockResolvedValue(mockCategory);
      Category.findOne.mockResolvedValue({ _id: '456', name: 'Existing Category' });

      await updateCategory(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Category name already exists' });
    });

    test('should handle server errors', async () => {
      req.params.id = '123';
      Category.findById.mockRejectedValue(new Error('Database error'));

      await updateCategory(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalled();
    });
  });

  describe('deleteCategory', () => {
    test('should delete category successfully', async () => {
      req.params.id = '123';
      const mockCategory = { _id: '123', name: 'Test Category' };
      Category.findById.mockResolvedValue(mockCategory);
      Category.findByIdAndDelete.mockResolvedValue(mockCategory);

      await deleteCategory(req, res);

      expect(Category.findById).toHaveBeenCalledWith('123');
      expect(Category.findByIdAndDelete).toHaveBeenCalledWith('123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Category deleted successfully' });
    });

    test('should return 404 if category not found', async () => {
      req.params.id = '123';
      Category.findById.mockResolvedValue(null);

      await deleteCategory(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Category not found' });
    });

    test('should handle server errors', async () => {
      req.params.id = '123';
      Category.findById.mockRejectedValue(new Error('Database error'));

      await deleteCategory(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalled();
    });
  });

  describe('addTopicToCategory', () => {
    test('should add topic to category successfully', async () => {
      req.params.id = '123';
      req.body = { topicId: '456' };
      const mockCategory = {
        _id: '123',
        topics: [],
        save: jest.fn().mockResolvedValue({ _id: '123', topics: ['456'] })
      };
      const mockTopic = { _id: '456', name: 'Test Topic' };
      Category.findById.mockResolvedValue(mockCategory);
      Topic.findById.mockResolvedValue(mockTopic);

      await addTopicToCategory(req, res);

      expect(Category.findById).toHaveBeenCalledWith('123');
      expect(Topic.findById).toHaveBeenCalledWith('456');
      expect(mockCategory.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
    });

    test('should return 404 if category not found', async () => {
      req.params.id = '123';
      req.body = { topicId: '456' };
      Category.findById.mockResolvedValue(null);

      await addTopicToCategory(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Category not found' });
    });

    test('should return 404 if topic not found', async () => {
      req.params.id = '123';
      req.body = { topicId: '456' };
      const mockCategory = { _id: '123', topics: [] };
      Category.findById.mockResolvedValue(mockCategory);
      Topic.findById.mockResolvedValue(null);

      await addTopicToCategory(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Topic not found' });
    });

    test('should return 400 if topic already exists in category', async () => {
      req.params.id = '123';
      req.body = { topicId: '456' };
      const mockCategory = {
        _id: '123',
        topics: ['456'],
        includes: jest.fn().mockReturnValue(true)
      };
      const mockTopic = { _id: '456', name: 'Test Topic' };
      Category.findById.mockResolvedValue(mockCategory);
      Topic.findById.mockResolvedValue(mockTopic);

      await addTopicToCategory(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Topic already exists in this category' });
    });

    test('should handle server errors', async () => {
      req.params.id = '123';
      req.body = { topicId: '456' };
      Category.findById.mockRejectedValue(new Error('Database error'));

      await addTopicToCategory(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalled();
    });
  });

  describe('removeTopicFromCategory', () => {
    test('should remove topic from category successfully', async () => {
      req.params.id = '123';
      req.body = { topicId: '456' };
      const mockCategory = {
        _id: '123',
        topics: ['456', '789'],
        filter: jest.fn().mockReturnValue(['789']),
        save: jest.fn().mockResolvedValue({
          _id: '123',
          topics: ['789']
        })
      };
      Category.findById.mockResolvedValue(mockCategory);

      await removeTopicFromCategory(req, res);

      expect(Category.findById).toHaveBeenCalledWith('123');
      expect(mockCategory.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
    });

    test('should return 404 if category not found', async () => {
      req.params.id = '123';
      req.body = { topicId: '456' };
      Category.findById.mockResolvedValue(null);

      await removeTopicFromCategory(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Category not found' });
    });

    test('should handle server errors', async () => {
      req.params.id = '123';
      req.body = { topicId: '456' };
      Category.findById.mockRejectedValue(new Error('Database error'));

      await removeTopicFromCategory(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalled();
    });
  });
});

