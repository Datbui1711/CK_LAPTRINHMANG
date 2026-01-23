// src/config/multer.config.js
import multer from "multer";
import fs from "fs";

import { rootPath } from "../utils/path.helper.js";

/**
 * Tạo thư mục nếu chưa tồn tại
 * @param {string} dirPath - Đường dẫn thư mục cần tạo
 */
function ensureDirExists(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

/**
 * Trả về multer instance theo loại file (image, video)
 * @param {"image" | "video"} type - Loại file
 */
export function getMulterUpload(type = "image") {
    const dirMap = {
        image: rootPath("app/uploads/images"),
        video: rootPath("app/uploads/videos"),
    };

    const allowedMimeTypes = {
        image: /jpeg|jpg|png|gif|webp/,
        video: /mp4|webm|ogg|quicktime/,
    };

    const limits = {
        image: 5 * 1024 * 1024, // 5MB
        video: 100 * 1024 * 1024, // 100MB
    };

    const uploadDir = dirMap[type] || dirMap.image;
    ensureDirExists(uploadDir);

    const fileFilter = (req, file, cb) => {
        const mime = file.mimetype.toLowerCase();
        if (allowedMimeTypes[type].test(mime)) {
            cb(null, true);
        } else {
            cb(new Error(`File ${type} không hợp lệ.`));
        }
    };

    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
            cb(null, Date.now() + "-" + file.originalname);
        },
    });

    return multer({
        storage,
        fileFilter,
        limits: { fileSize: limits[type] },
    });
}
