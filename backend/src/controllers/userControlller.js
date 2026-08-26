import * as userService from "../services/userService.js";

// =========== USER CONTROLLER ===========

// ----- Collection ------

// Create New User
export const createUser = async (req, res) => {
    try {
        const user = await userService.createUser(req.body);

        return res.status(201).json({
            success: true,
            message: "User berhasil didaftarkan",
            data: user,
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

// Login
export const login = async (req, res) => {
    try {
        const result = await userService.login(req.body);

        return res.status(200).json({
            success: true,
            message: "Login berhasil",
            data: result,
        });
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: error.message,
        });
    }
};