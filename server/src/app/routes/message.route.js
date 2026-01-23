import express from "express";
import { protect } from "../../middlewares/auth.middleware.js";
import {
    getMessagesBetween,
    addReaction,
    removeReaction,
} from "../controllers/message.controller.js";

const router = express.Router();

router.post("/history", protect, getMessagesBetween);
router.post("/reaction/add", protect, addReaction);
router.post("/reaction/remove", protect, removeReaction);

export default router;
