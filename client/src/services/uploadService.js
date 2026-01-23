import API from "../api/axios";

export const uploadImage = (file) => {
    const formData = new FormData();
    formData.append("image", file);
    return API.post("/upload/image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
};

export const uploadVideo = (file) => {
    const formData = new FormData();
    formData.append("video", file);
    return API.post("/upload/video", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
};
