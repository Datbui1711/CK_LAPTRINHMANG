import { FileText } from "lucide-react";

export const getFileSize = (bytes) => {
    if (bytes === 0) {
        return "0 Bytes";
    }

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    const size = bytes / Math.pow(k, i);
    return `${Number.parseFloat(size.toFixed(2))} ${sizes[i]}`;
};

export const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    });
};

export const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, text: "", color: "" };

    let strength = 0;
    if (password.length >= 6) strength += 1;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;

    const levels = [
        { text: "Rất yếu", color: "#ef4444" },
        { text: "Yếu", color: "#f97316" },
        { text: "Trung bình", color: "#eab308" },
        { text: "Mạnh", color: "#22c55e" },
        { text: "Rất mạnh", color: "#16a34a" },
    ];

    return { strength, ...levels[Math.min(strength, 4)] };
};

export const isValidEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
};

/**
 * Trả về chuỗi mô tả thời gian tương đối (theo kiểu "Vài phút trước", "3 giờ trước", "Hôm qua", v.v.)
 * dùng để hiển thị thời gian một cách thân thiện với người dùng.
 *
 * @function getTimeAgoLabel
 * @param {string|Date} dateString - Thời điểm cần định dạng (chuỗi ISO hoặc đối tượng Date).
 * @returns {string} Chuỗi định dạng thời gian dễ hiểu theo ngữ cảnh hiện tại.
 *
 */
export const getTimeAgoLabel = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();

    const isSameDay =
        date.getDate() === now.getDate() &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear();

    if (isSameDay) {
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffHours = Math.floor(diffTime / (1000 * 60 * 60));

        if (diffHours < 1) {
            return "Vài phút trước";
        }
        return `${diffHours} giờ trước`;
    }

    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
        return "Hôm qua";
    }
    if (diffDays < 7) {
        return `${diffDays} ngày trước`;
    }

    return date.toLocaleDateString("vi-VN");
};
