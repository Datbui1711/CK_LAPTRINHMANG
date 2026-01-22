import express from "express";

import {
    acceptFriendRequest,
    getFriendRequests,
    getFriends,
    rejectFriendRequest,
    searchFriends,
    searchUsersToAddFriend,
    sendFriendRequest,
} from "../controllers/friend.controller.js";
import { protect } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", protect, getFriends);
router.get("/requests", protect, getFriendRequests);
router.get("/search-to-add", protect, searchUsersToAddFriend);
router.get("/search", protect, searchFriends);

router.post("/request", protect, sendFriendRequest);
router.post("/accept", protect, acceptFriendRequest);
router.post("/reject", protect, rejectFriendRequest);

export default router;
