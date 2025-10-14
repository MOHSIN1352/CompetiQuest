const Question = require('../Models/QuestionModel');
const Company = require('../Models/CompanyModel');

exports.createQuestion = async (req, res) => {
    try {
        const { 
            question_text, 
            options, 
            correct_option_index, 
            difficulty, 
            subjects, 
            companies 
        } = req.body;

        if (!question_text || !options || correct_option_index === undefined) {
            return res.status(400).json({ 
                message: 'Question text, options, and correct option index are required' 
            });
        }

        if (options.length < 2) {
            return res.status(400).json({ 
                message: 'At least two options are required' 
            });
        }

        if (correct_option_index < 0 || correct_option_index >= options.length) {
            return res.status(400).json({ 
                message: 'Correct option index must be within options range' 
            });
        }

        const questionExists = await Question.findOne({ question_text });
        if (questionExists) {
            return res.status(400).json({ message: 'Question with this text already exists' });
        }

        if (companies && companies.length > 0) {
            const validCompanies = await Company.find({ _id: { $in: companies } });
            if (validCompanies.length !== companies.length) {
                return res.status(400).json({ message: 'One or more companies are invalid' });
            }
        }

        const question = await Question.create({
            question_text,
            options,
            correct_option_index,
            difficulty: difficulty || 'medium',
            subjects: subjects || [],
            companies: companies || []
        });

        const populatedQuestion = await Question.findById(question._id)
            .populate('companies', 'name description');

        res.status(201).json(populatedQuestion);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};


exports.getAllQuestions = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 10, 
            search, 
            difficulty, 
            subjects, 
            companies,
            sortBy = 'created_at',
            sortOrder = 'desc'
        } = req.query;
        
        let query = {};
        
        if (search) {
            query.question_text = { $regex: search, $options: 'i' };
        }

        if (difficulty) {
            query.difficulty = difficulty;
        }

        if (subjects) {
            const subjectArray = subjects.split(',');
            query.subjects = { $in: subjectArray };
        }

        if (companies) {
            const companyArray = companies.split(',');
            query.companies = { $in: companyArray };
        }

        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const questions = await Question.find(query)
            .populate('companies', 'name description')
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

exports.getQuestionById = async (req, res) => {
    try {
        const question = await Question.findById(req.params.id)
            .populate('companies', 'name description');
        
        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        res.status(200).json(question);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.updateQuestion = async (req, res) => {
    try {
        const { 
            question_text, 
            options, 
            correct_option_index, 
            difficulty, 
            subjects, 
            companies 
        } = req.body;

        const question = await Question.findById(req.params.id);

        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

       
        if (options && options.length < 2) {
            return res.status(400).json({ message: 'At least two options are required' });
        }

        if (correct_option_index !== undefined) {
            const optionsToCheck = options || question.options;
            if (correct_option_index < 0 || correct_option_index >= optionsToCheck.length) {
                return res.status(400).json({ 
                    message: 'Correct option index must be within options range' 
                });
            }
        }

        
        if (question_text && question_text !== question.question_text) {
            const questionExists = await Question.findOne({ question_text });
            if (questionExists) {
                return res.status(400).json({ message: 'Question with this text already exists' });
            }
        }

        
        if (companies && companies.length > 0) {
            const validCompanies = await Company.find({ _id: { $in: companies } });
            if (validCompanies.length !== companies.length) {
                return res.status(400).json({ message: 'One or more companies are invalid' });
            }
        }

        question.question_text = question_text || question.question_text;
        question.options = options || question.options;
        question.correct_option_index = correct_option_index !== undefined ? correct_option_index : question.correct_option_index;
        question.difficulty = difficulty || question.difficulty;
        question.subjects = subjects || question.subjects;
        question.companies = companies || question.companies;
        question.updated_at = new Date();

        const updatedQuestion = await question.save();
        
        const populatedQuestion = await Question.findById(updatedQuestion._id)
            .populate('companies', 'name description');

        res.status(200).json(populatedQuestion);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};


exports.deleteQuestion = async (req, res) => {
    try {
        const question = await Question.findById(req.params.id);
        
        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        await Question.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Question deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};


exports.getQuestionsByDifficulty = async (req, res) => {
    try {
        const { difficulty } = req.params;
        const { page = 1, limit = 10 } = req.query;

        if (!['easy', 'medium', 'hard'].includes(difficulty)) {
            return res.status(400).json({ message: 'Invalid difficulty level' });
        }

        const questions = await Question.find({ difficulty })
            .populate('companies', 'name description')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ created_at: -1 });

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


exports.getQuestionsBySubject = async (req, res) => {
    try {
        const { subject } = req.params;
        const { page = 1, limit = 10 } = req.query;

        const questions = await Question.find({ subjects: subject })
            .populate('companies', 'name description')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ created_at: -1 });

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


exports.getQuestionsByCompany = async (req, res) => {
    try {
        const { companyId } = req.params;
        const { page = 1, limit = 10 } = req.query;

        const questions = await Question.find({ companies: companyId })
            .populate('companies', 'name description')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ created_at: -1 });

        const total = await Question.countDocuments({ companies: companyId });

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


exports.getRandomQuestions = async (req, res) => {
    try {
        const { 
            count = 10, 
            difficulty, 
            subjects, 
            companies 
        } = req.query;

        let query = {};

        if (difficulty) {
            query.difficulty = difficulty;
        }

        if (subjects) {
            const subjectArray = subjects.split(',');
            query.subjects = { $in: subjectArray };
        }

        if (companies) {
            const companyArray = companies.split(',');
            query.companies = { $in: companyArray };
        }

        const questions = await Question.aggregate([
            { $match: query },
            { $sample: { size: parseInt(count) } },
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
                    correct_option_index: 0 // Don't send correct answer
                }
            }
        ]);

        res.status(200).json(questions);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};


exports.searchQuestions = async (req, res) => {
    try {
        const { q } = req.query;
        
        if (!q) {
            return res.status(400).json({ message: 'Search query is required' });
        }

        const questions = await Question.find({
            $or: [
                { question_text: { $regex: q, $options: 'i' } },
                { subjects: { $in: [new RegExp(q, 'i')] } }
            ]
        })
        .populate('companies', 'name description')
        .limit(10);

        res.status(200).json(questions);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
