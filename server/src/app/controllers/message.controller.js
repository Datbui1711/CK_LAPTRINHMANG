import Message from "../models/message.model.js";

export const getMessagesBetween = async (req, res) => {
    const { userId } = req;
    const { otherUserId, groupId, before, limit = 20 } = req.body;

    let query = {};

    if (groupId) {
        // Group chat
        query = { group: groupId };
    } else if (otherUserId) {
        // 1-1 chat
        query = {
        $or: [
            { from: userId, to: otherUserId },
            { from: otherUserId, to: userId },
        ],
    };
    } else {
        return res.status(400).json({ error: "Thiếu otherUserId hoặc groupId trong body" });
    }

    if (before) {
        query.createdAt = { $lt: new Date(before) };
    }

    try {
        const messages = await Message.find(query)
            .populate("from", "name email avatar")
            .populate("reactions.users", "name email")
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .lean();

        res.json(messages.reverse());
    } catch (err) {
        console.error("❌ Lỗi khi lấy tin nhắn:", err);
        res.status(500).json({ error: "Không lấy được tin nhắn" });
    }
};

export const addReaction = async (req, res) => {
    const { userId } = req;
    const { messageId, emoji } = req.body;

    if (!messageId || !emoji) {
        return res.status(400).json({ error: "Thiếu messageId hoặc emoji" });
    }

    try {
        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({ error: "Không tìm thấy tin nhắn" });
        }

        // Tìm reaction với emoji này
        let reaction = message.reactions.find((r) => r.emoji === emoji);

        if (reaction) {
            // Nếu đã có reaction này, thêm user vào nếu chưa có
            if (!reaction.users.includes(userId)) {
                reaction.users.push(userId);
            }
        } else {
            // Tạo reaction mới
            message.reactions.push({
                emoji,
                users: [userId],
            });
        }

        await message.save();

        const updatedMessage = await Message.findById(messageId)
            .populate("reactions.users", "name email")
            .lean();

        res.json({
            message: "Thêm reaction thành công",
            reactions: updatedMessage.reactions,
        });
    } catch (err) {
        console.error("❌ Lỗi khi thêm reaction:", err);
        res.status(500).json({ error: "Không thể thêm reaction" });
    }
};

export const removeReaction = async (req, res) => {
    const { userId } = req;
    const { messageId, emoji } = req.body;

    if (!messageId || !emoji) {
        return res.status(400).json({ error: "Thiếu messageId hoặc emoji" });
    }

    try {
        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({ error: "Không tìm thấy tin nhắn" });
        }

        // Tìm reaction với emoji này
        const reaction = message.reactions.find((r) => r.emoji === emoji);

        if (reaction) {
            // Xóa user khỏi reaction
            reaction.users = reaction.users.filter(
                (id) => id.toString() !== userId.toString()
            );

            // Nếu không còn user nào, xóa reaction
            if (reaction.users.length === 0) {
                message.reactions = message.reactions.filter(
                    (r) => r.emoji !== emoji
                );
            }
        }

        await message.save();

        const updatedMessage = await Message.findById(messageId)
            .populate("reactions.users", "name email")
            .lean();

        res.json({
            message: "Xóa reaction thành công",
            reactions: updatedMessage.reactions,
        });
    } catch (err) {
        console.error("❌ Lỗi khi xóa reaction:", err);
        res.status(500).json({ error: "Không thể xóa reaction" });
    }
};
