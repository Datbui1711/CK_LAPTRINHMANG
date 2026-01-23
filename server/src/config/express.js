import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

import router from "../routes.js";
import { rootPath } from "../utils/path.helper.js";

// Tạo lại __dirname do đang dùng ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Cấu hình và trả về một instance của ứng dụng Express.
 *
 * Hàm này thiết lập các middleware cho CORS, ghi log, phân tích JSON, và xử lý cookie.
 * Nó cũng định nghĩa route chính cho API và route mặc định cho đường dẫn gốc.
 *
 * @returns {Express.Application} Instance ứng dụng Express đã được cấu hình.
 */
export const configureExpress = () => {
    const app = express();

    app.use(
        cors({
            origin: process.env.FRONTEND_URL,
            credentials: true,
        })
    );
    app.use(morgan("dev"));
    app.use(express.json());
    app.use(cookieParser());
    // cho phép truy cập file trực tiếp trong hệ thống
    app.use("/uploads", express.static(rootPath("app/uploads")));

    app.use("/api", router);

    app.get("/", (req, res) => {
        res.json({ message: "Welcome to the Social API!" });
    });

    return app;
};
