import API from "../api/axios";

// Tạo nhóm mới
export const createGroup = (name, description, memberIds) => {
    return API.post("/groups", { name, description, memberIds });
};

// Lấy danh sách nhóm của user
export const getMyGroups = () => {
    return API.get("/groups");
};

// Lấy thông tin chi tiết nhóm
export const getGroupById = (groupId) => {
    return API.get(`/groups/${groupId}`);
};

// Cập nhật thông tin nhóm
export const updateGroup = (groupId, data) => {
    return API.put(`/groups/${groupId}`, data);
};

// Cập nhật settings nhóm
export const updateGroupSettings = (groupId, settings) => {
    return API.put(`/groups/${groupId}/settings`, settings);
};

// Thêm thành viên
export const addMembers = (groupId, memberIds) => {
    return API.post(`/groups/${groupId}/members`, { memberIds });
};

// Xóa thành viên
export const removeMember = (groupId, memberId) => {
    return API.delete(`/groups/${groupId}/members/${memberId}`);
};

// Rời nhóm
export const leaveGroup = (groupId) => {
    return API.post(`/groups/${groupId}/leave`);
};

// Cập nhật admin (thêm/xóa admin)
export const updateAdmin = (groupId, memberId, isAdmin) => {
    return API.put(`/groups/${groupId}/admin`, { memberId, isAdmin });
};

// Xóa nhóm
export const deleteGroup = (groupId) => {
    return API.delete(`/groups/${groupId}`);
};

