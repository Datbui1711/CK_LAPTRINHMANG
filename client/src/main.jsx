import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App";
import GlobalStyles from "./components/GlobalStyles/GlobalStyles";
import ToastProvider from "./contexts/ToastProvider";
import ToastContainer from "./components/ToastContainer/ToastContainer";

// Áp dụng theme ngay khi page load để tránh flash
(function applyThemeOnLoad() {
    const THEME_STORAGE_KEY = "moji-n10-theme";
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    
    if (savedTheme === "dark") {
        document.documentElement.classList.add("dark");
    } else if (savedTheme === "light") {
        document.documentElement.classList.remove("dark");
    } else {
        // Nếu chưa có theme, kiểm tra system preference
        if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
            document.documentElement.classList.add("dark");
        }
    }
})();

createRoot(document.getElementById("root")).render(
    <GlobalStyles>
        <ToastProvider>
            <App />
            <ToastContainer position="top-right" maxToasts={5} />
        </ToastProvider>
    </GlobalStyles>
);
