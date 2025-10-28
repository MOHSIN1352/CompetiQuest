import Company from '../Models/CompanyModel.js';

export const createCompany = async (req, res) => {
    try {
        const { name, description, website } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'Company name is required' });
        }

        const companyExists = await Company.findOne({ name });
        if (companyExists) {
            return res.status(400).json({ message: 'Company with this name already exists' });
        }

        const company = await Company.create({
            name,
            description,
            website
        });

        res.status(201).json(company);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

export const getAllCompanies = async (req, res) => {
    try {
        const { page = 1, limit = 10, search } = req.query;
        
        let query = {};
        
        if (search) {
            query = {
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } }
                ]
            };
        }

        const companies = await Company.find(query)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ created_at: -1 });

        const total = await Company.countDocuments(query);

        res.status(200).json({
            companies,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

export const getCompanyById = async (req, res) => {
    try {
        const company = await Company.findById(req.params.id);
        
        if (!company) {
            return res.status(404).json({ message: 'Company not found' });
        }

        res.status(200).json(company);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

export const updateCompany = async (req, res) => {
    try {
        const { name, description, website } = req.body;
        const company = await Company.findById(req.params.id);

        if (!company) {
            return res.status(404).json({ message: 'Company not found' });
        }

        if (name && name !== company.name) {
            const nameExists = await Company.findOne({ name });
            if (nameExists) {
                return res.status(400).json({ message: 'Company with this name already exists' });
            }
        }

        company.name = name || company.name;
        company.description = description !== undefined ? description : company.description;
        company.website = website !== undefined ? website : company.website;

        const updatedCompany = await company.save();

        res.status(200).json(updatedCompany);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

export const deleteCompany = async (req, res) => {
    try {
        const company = await Company.findById(req.params.id);
        
        if (!company) {
            return res.status(404).json({ message: 'Company not found' });
        }

        await Company.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Company deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

export const searchCompanies = async (req, res) => {
    try {
        const { q } = req.query;
        
        if (!q) {
            return res.status(400).json({ message: 'Search query is required' });
        }

        const companies = await Company.find({
            name: { $regex: q, $options: 'i' }
        }).limit(10);

        res.status(200).json(companies);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
