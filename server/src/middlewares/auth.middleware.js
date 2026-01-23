import { verifyToken } from "../utils/jwt.js";

/**
 * Middleware bảo vệ các route yêu cầu người dùng đã đăng nhập.
 *
 * @function protect
 * @middleware
 *
 * @param {Object} req - Đối tượng request từ Express.
 * @param {Object} req.cookies - Cookie của client, chứa token đăng nhập.
 * @param {Object} res - Đối tượng response từ Express.
 * @param {Function} next - Hàm tiếp theo trong chuỗi middleware.
 *
 * @description
 * - Kiểm tra sự tồn tại và hợp lệ của token trong cookie.
 * - Nếu hợp lệ, gán `req.userId` từ payload của token.
 * - Nếu không, trả về lỗi 401 (Unauthorized).
 *
 * @returns {void}
 *
 * @example
 * // Sử dụng middleware để bảo vệ route
 * app.get('/api/profile', protect, getProfile);
 */
export const protect = (req, res, next) => {
    try {
        const token = req.cookies?.token;

        if (!token) {
            return res.status(401).json({
                error: "Chưa đăng nhập",
            });
        }

        const decoded = verifyToken(token);
        req.userId = decoded.id;
        next();
    } catch (err) {
        return res
            .status(401)
            .json({ error: "Token không hợp lệ hoặc đã hết hạn" });
    }
};
