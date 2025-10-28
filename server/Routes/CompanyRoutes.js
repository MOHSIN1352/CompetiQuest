import express from 'express';
const router = express.Router();

import {
    createCompany,
    getAllCompanies,
    getCompanyById,
    updateCompany,
    deleteCompany,
    searchCompanies
} from '../Controllers/CompanyControllers.js';

    
import { protect, admin } from '../Middleware/AuthMiddleware.js';


router.get("/", getAllCompanies);
router.get("/search", searchCompanies);
router.get("/:id", getCompanyById);


router.post("/", protect, admin, createCompany);
router.put("/:id", protect, admin, updateCompany);
router.delete("/:id", protect, admin, deleteCompany);

export default router;
