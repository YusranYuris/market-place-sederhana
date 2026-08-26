import express from "express";
import {
    createUser,
    login
} from "../controllers/userControlller.js"

const router = express.Router();

// =========== USER ROUTES ===========

// ----- Collection ------

// Create New User
router.post("/", createUser);

// Login
router.post("/login", login);

export default router;