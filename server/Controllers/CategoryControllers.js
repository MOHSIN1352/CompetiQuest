import Category from '../Models/CategoryModel.js';
import Topic from '../Models/TopicModel.js';

// Create a new category
export const createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name) return res.status(400).json({ message: 'Category name is required' });

        const exists = await Category.findOne({ name });
        if (exists) return res.status(400).json({ message: 'Category already exists' });

        const category = await Category.create({ name, description });
        res.status(201).json(category);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Get all categories
export const getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find().populate('topics', 'name description');
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Get category by ID
export const getCategoryById = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id).populate('topics', 'name description');
        if (!category) return res.status(404).json({ message: 'Category not found' });
        res.status(200).json(category);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Update category
export const updateCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        const category = await Category.findById(req.params.id);
        if (!category) return res.status(404).json({ message: 'Category not found' });

        if (name && name !== category.name) {
            const exists = await Category.findOne({ name });
            if (exists) return res.status(400).json({ message: 'Category name already exists' });
        }

        category.name = name || category.name;
        category.description = description !== undefined ? description : category.description;

        const updatedCategory = await category.save();
        res.status(200).json(updatedCategory);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Delete category
export const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) return res.status(404).json({ message: 'Category not found' });

        await Category.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Category deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Add topic to category
export const addTopicToCategory = async (req, res) => {
    try {
        const { topicId } = req.body;
        const category = await Category.findById(req.params.id);
        if (!category) return res.status(404).json({ message: 'Category not found' });

        const topic = await Topic.findById(topicId);
        if (!topic) return res.status(404).json({ message: 'Topic not found' });

        if (category.topics.includes(topicId)) {
            return res.status(400).json({ message: 'Topic already exists in this category' });
        }

        category.topics.push(topicId);
        const updatedCategory = await category.save();

        res.status(200).json(updatedCategory);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Remove topic from category
export const removeTopicFromCategory = async (req, res) => {
    try {
        const { topicId } = req.body;
        const category = await Category.findById(req.params.id);
        if (!category) return res.status(404).json({ message: 'Category not found' });

        category.topics = category.topics.filter(id => id.toString() !== topicId);
        const updatedCategory = await category.save();

        res.status(200).json(updatedCategory);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
