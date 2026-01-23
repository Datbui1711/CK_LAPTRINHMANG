import Group from "../models/group.model.js";
import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import { emitGroupUpdate, emitToUsers } from "../../config/socket.js";

// Tạo nhóm mới
export const createGroup = async (req, res) => {
    try {
        const { userId } = req;
        const { name, description, memberIds } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ error: "Tên nhóm là bắt buộc" });
        }

        // Tạo nhóm với creator là admin và member đầu tiên
        const members = [
                {
                    user: userId,
                    role: "admin",
                joinedAt: new Date(),
            },
        ];

        // Thêm các thành viên khác nếu có (giới hạn tối đa 100 người)
        const MAX_MEMBERS = 100;
        if (memberIds && Array.isArray(memberIds)) {
            const uniqueMemberIds = [...new Set(memberIds)];
            for (const memberId of uniqueMemberIds) {
                // Kiểm tra không vượt quá giới hạn
                if (members.length >= MAX_MEMBERS) {
                    break;
                }
                
                if (memberId.toString() !== userId.toString()) {
                    // Kiểm tra user có tồn tại không
                    const user = await User.findById(memberId);
                    if (user) {
                        members.push({
                            user: memberId,
                    role: "member",
                            joinedAt: new Date(),
                        });
                    }
                }
            }
        }
        
        // Kiểm tra tổng số thành viên không vượt quá 100
        if (members.length > MAX_MEMBERS) {
            return res.status(400).json({ 
                error: `Số thành viên tối đa là ${MAX_MEMBERS} người` 
            });
        }

        const group = await Group.create({
            name: name.trim(),
            description: description?.trim() || "",
            createdBy: userId,
            admins: [userId],
            members,
        });

        const populatedGroup = await Group.findById(group._id)
            .populate("createdBy", "name email avatar")
            .populate("members.user", "name email avatar")
            .populate("admins", "name email avatar")
            .lean();

        // Emit event đến tất cả members
        await emitGroupUpdate(group._id, "groupCreated", { group: populatedGroup });

        res.status(201).json({
            message: "Tạo nhóm thành công",
            group: populatedGroup,
        });
    } catch (err) {
        console.error("❌ Lỗi khi tạo nhóm:", err);
        res.status(500).json({ error: "Không thể tạo nhóm" });
    }
};

// Lấy danh sách nhóm của user
export const getMyGroups = async (req, res) => {
    try {
        const { userId } = req;

        const groups = await Group.find({
            "members.user": userId,
        })
            .populate("createdBy", "name email avatar")
            .populate("members.user", "name email avatar")
            .populate("admins", "name email avatar")
            .sort({ updatedAt: -1 })
            .lean();

        res.json(groups);
    } catch (err) {
        console.error("❌ Lỗi khi lấy danh sách nhóm:", err);
        res.status(500).json({ error: "Không thể lấy danh sách nhóm" });
    }
};

// Lấy thông tin chi tiết nhóm
export const getGroupById = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { userId } = req;

        const group = await Group.findById(groupId)
            .populate("createdBy", "name email avatar")
            .populate("members.user", "name email avatar")
            .populate("admins", "name email avatar")
            .lean();

        if (!group) {
            return res.status(404).json({ error: "Không tìm thấy nhóm" });
        }

        // Kiểm tra user có trong nhóm không
        // Handle both populated and non-populated user
        const isMember = group.members.some((m) => {
            const memberUserId = m.user?._id?.toString() || m.user?.toString();
            return memberUserId === userId.toString();
        });

        if (!isMember) {
            return res.status(403).json({ error: "Bạn không phải thành viên của nhóm này" });
        }

        res.json(group);
    } catch (err) {
        console.error("❌ Lỗi khi lấy thông tin nhóm:", err);
        res.status(500).json({ error: "Không thể lấy thông tin nhóm" });
    }
};

// Thêm thành viên vào nhóm
export const addMembers = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { userId } = req;
        const { memberIds } = req.body;

        if (!memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
            return res.status(400).json({ error: "Danh sách thành viên không hợp lệ" });
        }

        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({ error: "Không tìm thấy nhóm" });
        }

        // Kiểm tra quyền: phải là admin hoặc creator
        const isAdmin = group.admins.some(
            (adminId) => adminId.toString() === userId.toString()
        );
        const isCreator = group.createdBy.toString() === userId.toString();

        // Nếu không phải admin/creator, kiểm tra allowMemberInvite
        if (!isAdmin && !isCreator) {
            if (!group.settings?.allowMemberInvite) {
                return res.status(403).json({ 
                    error: "Bạn không có quyền thêm thành viên. Chỉ admin mới có thể thêm thành viên." 
                });
            }
        }

        // Kiểm tra số thành viên tối đa
        const maxMembers = group.settings?.maxMembers || 100;
        const currentMemberCount = group.members.length;
        
        if (currentMemberCount >= maxMembers) {
            return res.status(400).json({ 
                error: `Nhóm đã đạt số thành viên tối đa (${maxMembers} người)` 
            });
        }

        // Thêm các thành viên mới
        const existingMemberIds = group.members.map((m) => m.user.toString());
        const newMembers = [];
        const maxNewMembers = maxMembers - currentMemberCount;

        for (const memberId of memberIds) {
            // Kiểm tra xem đã đạt maxMembers chưa
            if (newMembers.length >= maxNewMembers) {
                break; // Dừng lại nếu đã đạt giới hạn
            }
            
            if (
                !existingMemberIds.includes(memberId.toString()) &&
                memberId.toString() !== userId.toString()
            ) {
                const user = await User.findById(memberId);
                if (user) {
                    newMembers.push({
                        user: memberId,
                role: "member",
                        joinedAt: new Date(),
                    });
                }
            }
        }

        if (newMembers.length === 0) {
            return res.status(400).json({ 
                error: currentMemberCount >= maxMembers 
                    ? `Nhóm đã đạt số thành viên tối đa (${maxMembers} người)`
                    : "Không có thành viên mới để thêm" 
            });
        }
        
        // Cảnh báo nếu chỉ thêm được một phần thành viên
        if (newMembers.length < memberIds.length && currentMemberCount + newMembers.length >= maxMembers) {
            console.warn(`⚠️ Chỉ thêm được ${newMembers.length}/${memberIds.length} thành viên do đạt giới hạn ${maxMembers} người`);
        }

        group.members.push(...newMembers);
        await group.save();

        const updatedGroup = await Group.findById(groupId)
            .populate("members.user", "name email avatar")
            .populate("admins", "name email avatar")
            .lean();

        // Emit event đến tất cả members (bao gồm cả members mới)
        await emitGroupUpdate(groupId, "groupUpdated", { group: updatedGroup });
        await emitGroupUpdate(groupId, "membersAdded", { 
            groupId, 
            addedMembers: newMembers.map(m => m.user),
            group: updatedGroup 
        });

        // Emit riêng đến các members mới để họ biết được thêm vào nhóm
        const newMemberIds = newMembers.map(m => m.user);
        emitToUsers(newMemberIds, "addedToGroup", { group: updatedGroup });

        res.json({
            message: `Đã thêm ${newMembers.length} thành viên vào nhóm`,
            group: updatedGroup,
        });
    } catch (err) {
        console.error("❌ Lỗi khi thêm thành viên:", err);
        res.status(500).json({ error: "Không thể thêm thành viên" });
    }
};

// Xóa thành viên khỏi nhóm
export const removeMember = async (req, res) => {
    try {
        const { groupId, memberId } = req.params;
        const { userId } = req;

        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({ error: "Không tìm thấy nhóm" });
        }

        // Kiểm tra quyền: phải là admin hoặc creator
        const isAdmin = group.admins.some(
            (adminId) => adminId.toString() === userId.toString()
            );
        const isCreator = group.createdBy.toString() === userId.toString();

        if (!isAdmin && !isCreator) {
            return res.status(403).json({ error: "Chỉ admin mới có thể xóa thành viên" });
        }

        // Không cho phép xóa creator
        if (memberId === group.createdBy.toString()) {
            return res.status(400).json({ error: "Không thể xóa người tạo nhóm" });
        }

        // Xóa thành viên
        const memberIndex = group.members.findIndex(
            (m) => m.user.toString() === memberId
        );

        if (memberIndex === -1) {
            return res.status(404).json({ error: "Không tìm thấy thành viên trong nhóm" });
        }

        // Xóa khỏi admins nếu là admin
        group.admins = group.admins.filter(
            (adminId) => adminId.toString() !== memberId
        );

        // Xóa khỏi members
        group.members.splice(memberIndex, 1);
        await group.save();

        const updatedGroup = await Group.findById(groupId)
            .populate("members.user", "name email avatar")
            .populate("admins", "name email avatar")
            .lean();

        // Emit event đến tất cả members
        await emitGroupUpdate(groupId, "groupUpdated", { group: updatedGroup });
        await emitGroupUpdate(groupId, "memberRemoved", { 
            groupId, 
            removedMemberId: memberId,
            group: updatedGroup 
        });

        res.json({
            message: "Đã xóa thành viên khỏi nhóm",
            group: updatedGroup,
        });
    } catch (err) {
        console.error("❌ Lỗi khi xóa thành viên:", err);
        res.status(500).json({ error: "Không thể xóa thành viên" });
    }
};

// Rời nhóm
export const leaveGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { userId } = req;

        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({ error: "Không tìm thấy nhóm" });
        }

        // Không cho phép creator rời nhóm
        if (group.createdBy.toString() === userId.toString()) {
            return res.status(400).json({ error: "Người tạo nhóm không thể rời nhóm" });
        }

        // Xóa khỏi members
        group.members = group.members.filter(
            (m) => m.user.toString() !== userId.toString()
        );

        // Xóa khỏi admins nếu là admin
        group.admins = group.admins.filter(
            (adminId) => adminId.toString() !== userId.toString()
        );

        await group.save();

        const updatedGroup = await Group.findById(groupId)
            .populate("members.user", "name email avatar")
            .populate("admins", "name email avatar")
            .lean();

        // Emit event đến tất cả members
        await emitGroupUpdate(groupId, "groupUpdated", { group: updatedGroup });
        await emitGroupUpdate(groupId, "memberRemoved", { 
            groupId, 
            removedMemberId: userId,
            group: updatedGroup 
        });

        // Emit to user who left
        emitToUsers([userId], "groupLeft", { groupId });

        res.json({ message: "Đã rời nhóm thành công" });
    } catch (err) {
        console.error("❌ Lỗi khi rời nhóm:", err);
        res.status(500).json({ error: "Không thể rời nhóm" });
    }
};

// Cập nhật thông tin nhóm
export const updateGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { userId } = req;
        const { name, description, avatar } = req.body;

        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({ error: "Không tìm thấy nhóm" });
        }

        // Kiểm tra quyền: phải là admin hoặc creator
        const isAdmin = group.admins.some(
            (adminId) => adminId.toString() === userId.toString()
        );
        const isCreator = group.createdBy.toString() === userId.toString();

        if (!isAdmin && !isCreator) {
            return res.status(403).json({ error: "Chỉ admin mới có thể cập nhật thông tin nhóm" });
        }

        if (name !== undefined) {
            group.name = name.trim();
        }
        if (description !== undefined) {
            group.description = description.trim();
        }
        if (avatar !== undefined) {
            group.avatar = avatar;
        }

        await group.save();

        const updatedGroup = await Group.findById(groupId)
            .populate("createdBy", "name email avatar")
            .populate("members.user", "name email avatar")
            .populate("admins", "name email avatar")
            .lean();

        res.json({
            message: "Cập nhật thông tin nhóm thành công",
            group: updatedGroup,
        });
    } catch (err) {
        console.error("❌ Lỗi khi cập nhật nhóm:", err);
        res.status(500).json({ error: "Không thể cập nhật thông tin nhóm" });
    }
};

// Cập nhật settings nhóm
export const updateGroupSettings = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { userId } = req;
        const { allowMemberInvite, maxMembers } = req.body;

        console.log("📝 Update group settings:", { groupId, userId, allowMemberInvite, maxMembers });

        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({ error: "Không tìm thấy nhóm" });
        }

        // Chỉ creator mới có thể thay đổi settings
        if (group.createdBy.toString() !== userId.toString()) {
            return res.status(403).json({ error: "Chỉ người tạo nhóm mới có thể thay đổi cài đặt" });
        }

        if (allowMemberInvite !== undefined) {
            group.settings.allowMemberInvite = allowMemberInvite;
            console.log("✅ Updated allowMemberInvite to:", allowMemberInvite);
        }
        if (maxMembers !== undefined) {
            group.settings.maxMembers = Math.max(2, Math.min(maxMembers, 100));
        }

        await group.save();

        console.log("✅ Group settings saved:", {
            allowMemberInvite: group.settings.allowMemberInvite,
            maxMembers: group.settings.maxMembers,
        });

        const updatedGroup = await Group.findById(groupId)
            .populate("createdBy", "name email avatar")
            .populate("members.user", "name email avatar")
            .populate("admins", "name email avatar")
            .lean();

        res.json({
            message: "Cập nhật cài đặt nhóm thành công",
            group: updatedGroup,
        });
    } catch (err) {
        console.error("❌ Lỗi khi cập nhật cài đặt nhóm:", err);
        res.status(500).json({ error: "Không thể cập nhật cài đặt nhóm" });
    }
};

// Thêm/xóa admin
export const updateAdmin = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { userId } = req;
        const { memberId, isAdmin } = req.body;

        if (!memberId) {
            return res.status(400).json({ error: "Thiếu memberId" });
        }

        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({ error: "Không tìm thấy nhóm" });
        }

        // Chỉ creator mới có thể thay đổi admin
        if (group.createdBy.toString() !== userId.toString()) {
            return res.status(403).json({ error: "Chỉ người tạo nhóm mới có thể thay đổi admin" });
        }

        // Không thể thay đổi role của chính mình
        if (memberId === userId.toString()) {
            return res.status(400).json({ error: "Không thể thay đổi role của chính mình" });
        }

        // Kiểm tra member có trong nhóm không
        const member = group.members.find(
            (m) => m.user.toString() === memberId
        );

        if (!member) {
            return res.status(404).json({ error: "Không tìm thấy thành viên trong nhóm" });
        }

        if (isAdmin) {
            // Thêm vào admins nếu chưa có
            if (!group.admins.some((adminId) => adminId.toString() === memberId)) {
                group.admins.push(memberId);
                member.role = "admin";
            }
        } else {
            // Xóa khỏi admins
            group.admins = group.admins.filter(
                (adminId) => adminId.toString() !== memberId
            );
            member.role = "member";
        }

        await group.save();

        const updatedGroup = await Group.findById(groupId)
            .populate("members.user", "name email avatar")
            .populate("admins", "name email avatar")
            .lean();

        res.json({
            message: isAdmin ? "Đã thêm admin" : "Đã xóa admin",
            group: updatedGroup,
        });
    } catch (err) {
        console.error("❌ Lỗi khi cập nhật admin:", err);
        res.status(500).json({ error: "Không thể cập nhật admin" });
    }
};

// Xóa nhóm
export const deleteGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { userId } = req;

        if (!groupId) {
            return res.status(400).json({ error: "Thiếu groupId" });
        }

        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({ error: "Không tìm thấy nhóm" });
        }

        // Chỉ creator mới có thể xóa nhóm
        if (group.createdBy.toString() !== userId.toString()) {
            return res.status(403).json({ error: "Chỉ người tạo nhóm mới có thể xóa nhóm" });
        }

        // Lưu memberIds trước khi xóa
        const memberIds = group.members.map((m) => m.user);

        // Xóa tất cả messages của nhóm
        const deleteMessagesResult = await Message.deleteMany({ group: groupId });
        console.log(`🗑️ Đã xóa ${deleteMessagesResult.deletedCount} tin nhắn của nhóm ${groupId}`);

        // Xóa nhóm
        await Group.findByIdAndDelete(groupId);

        console.log(`✅ Nhóm ${groupId} đã được xóa bởi user ${userId}`);

        // Emit event đến tất cả members (sau khi xóa group)
        emitToUsers(memberIds, "groupDeleted", { groupId });

        res.status(200).json({ message: "Đã xóa nhóm thành công" });
    } catch (err) {
        console.error("❌ Lỗi khi xóa nhóm:", err);
        res.status(500).json({ error: "Không thể xóa nhóm: " + err.message });
    }
};

