export function handleMulterError(multerMiddleware, controller) {
    return (req, res) => {
        multerMiddleware(req, res, (err) => {
            if (err) {
                if (err.code === "LIMIT_FILE_SIZE") {
                    return res.status(413).json({
                        error: "Kích thước file vượt quá giới hạn cho phép!",
                    });
                }

                return res
                    .status(400)
                    .json({ error: err.message || "Lỗi upload file." });
            }

            if (!req.file) {
                return res
                    .status(400)
                    .json({ error: "Không có file hợp lệ được gửi lên." });
            }

            controller(req, res);
        });
    };
}
