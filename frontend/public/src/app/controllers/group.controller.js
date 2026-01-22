import Group from "../models/group.model.js";
import User from "../models/user.model.js";

export const createGroup = async (req, res) => {
    try {
        const { userId } = req;
        const { name, memberIds } = req.body;

        if (!name || !memberIds || !Array.isArray(memberIds)) {
            return res.status(400).json({
                error: "Thiếu tên nhóm hoặc danh sách thành viên",
            });
        }

        // Thêm admin vào danh sách thành viên nếu chưa có
        const allMemberIds = [
            ...new Set([userId, ...memberIds.map((id) => id.toString())]),
        ];

        const members = allMemberIds.map((memberId) => ({
            user: memberId,
            joinedAt: new Date(),
        }));

        const group = await Group.create({
            name,
            admin: userId,
            members,
        });

        const populatedGroup = await Group.findById(group._id)
            .populate("admin", "_id name email avatar")
            .populate("members.user", "_id name email avatar");

        res.status(201).json(populatedGroup);
    } catch (err) {
        console.error("Lỗi khi tạo nhóm:", err);
        res.status(500).json({ error: "Lỗi khi tạo nhóm" });
    }
};

export const getMyGroups = async (req, res) => {
    try {
        const { userId } = req;

        const groups = await Group.find({
            "members.user": userId,
        })
            .populate("admin", "_id name email avatar")
            .populate("members.user", "_id name email avatar")
            .sort({ updatedAt: -1 });

        res.json(groups);
    } catch (err) {
        console.error("Lỗi khi lấy danh sách nhóm:", err);
        res.status(500).json({ error: "Lỗi khi lấy danh sách nhóm" });
    }
};

export const getGroupById = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { userId } = req;

        const group = await Group.findById(groupId)
            .populate("admin", "_id name email avatar")
            .populate("members.user", "_id name email avatar");

        if (!group) {
            return res.status(404).json({ error: "Không tìm thấy nhóm" });
        }

        // Kiểm tra user có trong nhóm không
        const isMember = group.members.some(
            (m) => m.user._id.toString() === userId
        );

        if (!isMember) {
            return res
                .status(403)
                .json({ error: "Bạn không phải thành viên của nhóm này" });
        }

        res.json(group);
    } catch (err) {
        console.error("Lỗi khi lấy thông tin nhóm:", err);
        res.status(500).json({ error: "Lỗi khi lấy thông tin nhóm" });
    }
};

export const addMembers = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { userId } = req;
        const { memberIds } = req.body;

        if (!memberIds || !Array.isArray(memberIds)) {
            return res.status(400).json({
                error: "Thiếu danh sách thành viên",
            });
        }

        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({ error: "Không tìm thấy nhóm" });
        }

        // Chỉ admin mới có thể thêm thành viên
        if (group.admin.toString() !== userId) {
            return res
                .status(403)
                .json({ error: "Chỉ admin mới có thể thêm thành viên" });
        }

        // Thêm các thành viên mới (tránh trùng lặp)
        const existingMemberIds = group.members.map((m) =>
            m.user.toString()
        );
        const newMemberIds = memberIds.filter(
            (id) => !existingMemberIds.includes(id.toString())
        );

        if (newMemberIds.length === 0) {
            return res.status(400).json({
                error: "Tất cả người dùng đã là thành viên của nhóm",
            });
        }

        const newMembers = newMemberIds.map((memberId) => ({
            user: memberId,
            joinedAt: new Date(),
        }));

        group.members.push(...newMembers);
        await group.save();

        const populatedGroup = await Group.findById(groupId)
            .populate("admin", "_id name email avatar")
            .populate("members.user", "_id name email avatar");

        res.json(populatedGroup);
    } catch (err) {
        console.error("Lỗi khi thêm thành viên:", err);
        res.status(500).json({ error: "Lỗi khi thêm thành viên" });
    }
};

export const removeMember = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { userId } = req;
        const { memberId } = req.body;

        if (!memberId) {
            return res.status(400).json({ error: "Thiếu memberId" });
        }

        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({ error: "Không tìm thấy nhóm" });
        }

        // Chỉ admin mới có thể xóa thành viên
        if (group.admin.toString() !== userId) {
            return res
                .status(403)
                .json({ error: "Chỉ admin mới có thể xóa thành viên" });
        }

        // Không thể xóa admin
        if (group.admin.toString() === memberId) {
            return res.status(400).json({ error: "Không thể xóa admin" });
        }

        group.members = group.members.filter(
            (m) => m.user.toString() !== memberId
        );
        await group.save();

        const populatedGroup = await Group.findById(groupId)
            .populate("admin", "_id name email avatar")
            .populate("members.user", "_id name email avatar");

        res.json(populatedGroup);
    } catch (err) {
        console.error("Lỗi khi xóa thành viên:", err);
        res.status(500).json({ error: "Lỗi khi xóa thành viên" });
    }
};

export const leaveGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { userId } = req;

        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({ error: "Không tìm thấy nhóm" });
        }

        // Admin không thể rời nhóm
        if (group.admin.toString() === userId) {
            return res.status(400).json({
                error: "Admin không thể rời nhóm. Hãy chuyển quyền admin trước",
            });
        }

        group.members = group.members.filter(
            (m) => m.user.toString() !== userId
        );
        await group.save();

        res.json({ message: "Đã rời nhóm thành công" });
    } catch (err) {
        console.error("Lỗi khi rời nhóm:", err);
        res.status(500).json({ error: "Lỗi khi rời nhóm" });
    }
};

export const updateGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { userId } = req;
        const { name, avatar } = req.body;

        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({ error: "Không tìm thấy nhóm" });
        }

        // Chỉ admin mới có thể cập nhật
        if (group.admin.toString() !== userId) {
            return res
                .status(403)
                .json({ error: "Chỉ admin mới có thể cập nhật nhóm" });
        }

        if (name) group.name = name;
        if (avatar !== undefined) group.avatar = avatar;

        await group.save();

        const populatedGroup = await Group.findById(groupId)
            .populate("admin", "_id name email avatar")
            .populate("members.user", "_id name email avatar");

        res.json(populatedGroup);
    } catch (err) {
        console.error("Lỗi khi cập nhật nhóm:", err);
        res.status(500).json({ error: "Lỗi khi cập nhật nhóm" });
    }
};
