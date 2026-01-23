import axios from "axios";

const API = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL + "/api",
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

function extractErrorMessage(error) {
    return (
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Đã xảy ra lỗi không xác định."
    );
}

API.interceptors.response.use(
    function (response) {
        return response.data || { statusCode: response.status };
    },
    function (error) {
        return Promise.reject(new Error(extractErrorMessage(error)));
    }
);

export default API;
