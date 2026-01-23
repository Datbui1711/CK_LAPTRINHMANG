import API from "../api/axios";

export const addReaction = (messageId, emoji) => {
    return API.post("/messages/reaction/add", { messageId, emoji });
};

export const removeReaction = (messageId, emoji) => {
    return API.post("/messages/reaction/remove", { messageId, emoji });
};

