import express from "express";

import { protect } from "../../middlewares/auth.middleware.js";
import { uploadImage, uploadVideo } from "../controllers/upload.controller.js";
import { getMulterUpload } from "../../config/multer.config.js";
import { handleMulterError } from "../../middlewares/multer-error.handler.js";

const router = express.Router();

const uploadImageMulter = getMulterUpload("image").single("image");
const uploadVideoMulter = getMulterUpload("video").single("video");

router.post(
    "/image",
    protect,
    handleMulterError(uploadImageMulter, uploadImage)
);
router.post(
    "/video",
    protect,
    handleMulterError(uploadVideoMulter, uploadVideo)
);

export default router;
