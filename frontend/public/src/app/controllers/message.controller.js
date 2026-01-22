import Message from "../models/message.model.js";
import Group from "../models/group.model.js";

export const getMessagesBetween = async (req, res) => {
    const { userId } = req;
    const { otherUserId, before, limit = 20 } = req.body;

    if (!otherUserId) {
        return res.status(400).json({ error: "Thiếu otherUserId trong body" });
    }

    const query = {
        isGroup: false,
        $or: [
            { from: userId, to: otherUserId },
            { from: otherUserId, to: userId },
        ],
    };

    if (before) {
        query.createdAt = { $lt: new Date(before) };
    }

    try {
        const messages = await Message.find(query)
            .populate("from", "_id name email avatar")
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .lean();

        res.json(messages.reverse());
    } catch (err) {
        res.status(500).json({ error: "Không lấy được tin nhắn" });
    }
};

export const getGroupMessages = async (req, res) => {
    const { userId } = req;
    const { groupId, before, limit = 20 } = req.body;

    if (!groupId) {
        return res.status(400).json({ error: "Thiếu groupId trong body" });
    }

    try {
        // Kiểm tra user có trong nhóm không
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ error: "Không tìm thấy nhóm" });
        }

        const isMember = group.members.some(
            (m) => m.user.toString() === userId
        );
        if (!isMember) {
            return res
                .status(403)
                .json({ error: "Bạn không phải thành viên của nhóm này" });
        }

        const query = {
            isGroup: true,
            groupId: groupId,
        };

        if (before) {
            query.createdAt = { $lt: new Date(before) };
        }

        const messages = await Message.find(query)
            .populate("from", "_id name email avatar")
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .lean();

        res.json(messages.reverse());
    } catch (err) {
        console.error("Lỗi khi lấy tin nhắn nhóm:", err);
        res.status(500).json({ error: "Không lấy được tin nhắn nhóm" });
    }
};
