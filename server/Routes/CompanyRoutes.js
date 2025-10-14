const express = require("express");
const router = express.Router();

const {
    createCompany,
    getAllCompanies,
    getCompanyById,
    updateCompany,
    deleteCompany,
    searchCompanies
} = require("../Controllers/CompanyControllers");

    
const { protect, admin } = require("../Middleware/AuthMiddleware");


router.get("/", getAllCompanies);
router.get("/search", searchCompanies);
router.get("/:id", getCompanyById);


router.post("/", protect, admin, createCompany);
router.put("/:id", protect, admin, updateCompany);
router.delete("/:id", protect, admin, deleteCompany);

module.exports = router;
