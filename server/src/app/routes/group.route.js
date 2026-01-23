import express from "express";
import { protect } from "../../middlewares/auth.middleware.js";
import {
    createGroup,
    getMyGroups,
    getGroupById,
    addMembers,
    removeMember,
    leaveGroup,
    updateGroup,
    updateGroupSettings,
    updateAdmin,
    deleteGroup,
} from "../controllers/group.controller.js";

const router = express.Router();

// Tất cả routes đều cần authentication
router.use(protect);

// Tạo nhóm mới
router.post("/", createGroup);

// Lấy danh sách nhóm của user
router.get("/", getMyGroups);

// Lấy thông tin chi tiết nhóm
router.get("/:groupId", getGroupById);

// Cập nhật thông tin nhóm
router.put("/:groupId", updateGroup);

// Cập nhật settings nhóm
router.put("/:groupId/settings", updateGroupSettings);

// Thêm thành viên
router.post("/:groupId/members", addMembers);

// Xóa thành viên
router.delete("/:groupId/members/:memberId", removeMember);

// Rời nhóm
router.post("/:groupId/leave", leaveGroup);

// Cập nhật admin (thêm/xóa admin)
router.put("/:groupId/admin", updateAdmin);

// Xóa nhóm
router.delete("/:groupId", deleteGroup);

export default router;

