import API from "../api/axios";
import constants from "../constants";

export const getMessages = (
    otherUserId,
    before,
    limit = constants.CHAT_LIMIT,
    groupId = null
) => {
    if (groupId) {
        return API.post("/messages/history", { groupId, before, limit });
    } else {
        return API.post("/messages/history", { otherUserId, before, limit });
    }
};
