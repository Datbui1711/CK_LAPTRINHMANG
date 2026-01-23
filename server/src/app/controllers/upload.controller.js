export const uploadImage = (req, res) => {
    if (!req.file) {
        return res
            .status(400)
            .json({ error: "Không có ảnh hoặc định dạng ảnh không hợp lệ!" });
    }

    const fileUrl = `/uploads/images/${req.file.filename}`;
    res.status(200).json({ url: fileUrl });
};

export const uploadVideo = (req, res) => {
    if (!req.file) {
        return res
            .status(400)
            .json({
                error: "Không có video hoặc định dạng video không hợp lệ!",
            });
    }

    const fileUrl = `/uploads/videos/${req.file.filename}`;
    res.status(200).json({ url: fileUrl });
};
