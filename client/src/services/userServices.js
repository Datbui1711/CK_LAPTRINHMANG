import API from "../api/axios";

export const login = (data) => {
    return API.post("/users/login", data);
};

export const register = (data) => {
    return API.post("/users/register", data);
};

export const getProfile = () => {
    return API.get("/users/profile");
};

export const logout = () => {
    return API.post("/users/logout");
};
