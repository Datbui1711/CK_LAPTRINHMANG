import API from "../api/axios";

export const getFriends = () => {
    return API.get("/friends");
};

export const getFriendRequests = () => {
    return API.get("/friends/requests");
};

export const searchUsersToAddFriend = (query) => {
    return API.get("/friends/search-to-add", { params: { q: query } });
};

export const searchFriends = (q) => {
    return API.get("/friends/search", { params: { q } });
};

export const sendFriendRequest = (toUserId) => {
    return API.post("/friends/request", { toUserId });
};

export const acceptFriendRequest = (fromUserId) => {
    return API.post("/friends/accept", { fromUserId });
};

export const rejectFriendRequest = (fromUserId) => {
    return API.post("/friends/reject", { fromUserId });
};
