import { useCallback, useState } from "react";

import { ToastContext } from "./AppContext";

function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const addToast = useCallback(
        (toast) => {
            const id = Math.random().toString(36).substr(2, 9);
            const newToast = {
                id,
                duration: 5000,
                dismissible: true,
                ...toast,
            };

            setToasts((prev) => [...prev, newToast]);

            if (newToast.duration && newToast.duration > 0) {
                setTimeout(() => {
                    removeToast(id);
                }, newToast.duration);
            }
        },
        [removeToast]
    );

    const clearAllToasts = useCallback(() => {
        setToasts([]);
    }, []);

    return (
        <ToastContext.Provider
            value={{ toasts, addToast, removeToast, clearAllToasts }}
        >
            {children}
        </ToastContext.Provider>
    );
}

export default ToastProvider;
