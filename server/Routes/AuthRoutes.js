import express from "express";
const router = express.Router();
import {
  registerUser,
  loginUser,
  logoutUser,
} from "../Controllers/UserControllers.js";
import { protect } from "../Middleware/AuthMiddleware.js";

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/validate", protect, (req, res) => {
  res.json({ user: req.user });
});

export default router;
