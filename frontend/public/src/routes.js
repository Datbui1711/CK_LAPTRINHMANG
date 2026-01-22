import express from "express";
import userRoute from "./app/routes/user.route.js";
import friendRoute from "./app/routes/friend.route.js";
import messageRoute from "./app/routes/message.route.js";
import uploadRoute from "./app/routes/upload.route.js";
import groupRoute from "./app/routes/group.route.js";

const router = express.Router();

router.use("/users", userRoute);
router.use("/friends", friendRoute);
router.use("/messages", messageRoute);
router.use("/upload", uploadRoute);
router.use("/groups", groupRoute);

export default router;
