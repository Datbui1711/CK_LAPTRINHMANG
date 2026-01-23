import express from "express";

import {
    createUser,
    getAllUsers,
    getProfile,
    login,
    logout,
    register,
} from "../controllers/user.controller.js";
import { protect } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", getAllUsers);
router.post("/", createUser);

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

router.get("/profile", protect, getProfile);

export default router;
