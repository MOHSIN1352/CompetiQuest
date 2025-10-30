// Middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import User from "../Models/UserModel.js"; // note ES module path

export const protect = async (req, res, next) => {
  let token;

  // Read the token from the cookie
  if (req.cookies && req.cookies.jwt) {
    try {
      token = req.cookies.jwt;

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token ID
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({ message: "User not found" });
      }

      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

export const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Not authorized as admin" });
  }
};
