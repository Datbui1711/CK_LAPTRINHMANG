import { useState, useEffect } from "react";

const THEME_STORAGE_KEY = "moji-n10-theme";

export const useTheme = () => {
    const [isDark, setIsDark] = useState(() => {
        // Lấy theme từ localStorage hoặc mặc định là light
        const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme) {
            return savedTheme === "dark";
        }
        // Kiểm tra system preference
        return window.matchMedia("(prefers-color-scheme: dark)").matches;
    });

    useEffect(() => {
        // Lưu theme vào localStorage
        localStorage.setItem(THEME_STORAGE_KEY, isDark ? "dark" : "light");
        
        // Áp dụng theme vào document
        if (isDark) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }, [isDark]);

    const toggleTheme = () => {
        setIsDark((prev) => !prev);
    };

    return { isDark, toggleTheme };
};

