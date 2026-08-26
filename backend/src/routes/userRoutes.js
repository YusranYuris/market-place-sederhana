import express from "express";

import {
  createUser,
  login,
  getProfile,
  updateProfile,
} from "../controllers/userController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";

import { uploadImage } from "../middleware/uploadMiddleware.js";

const router = express.Router();

// =========== USER ROUTES ===========

// ----- Collection ------

// Create New User
router.post("/", createUser);

// Login
router.post("/login", login);

// ----- Profile ------

// Get Profile
router.get("/profile", authMiddleware, getProfile);

// Update Profile
router.put(
  "/profile",
  authMiddleware,
  uploadImage.single("foto_profil"),
  updateProfile
);

export default router;