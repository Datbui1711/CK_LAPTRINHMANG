import { createPortal } from "react-dom";

import useToast from "../../hooks/useToast";
import ToastItem from "../ToastItem/ToastItem";

import styles from "./ToastContainer.module.css";

function ToastContainer({ position, maxToasts = 5 }) {
    const { toasts, removeToast } = useToast();

    const visibleToasts = toasts.slice(-maxToasts);

    if (typeof window === "undefined") {
        return null;
    }

    return createPortal(
        <div
            className={`${styles["toast-container"]} ${
                styles[`toast-container-${position}`]
            }`}
        >
            {visibleToasts.map((toast) => (
                <ToastItem
                    key={toast.id}
                    toast={toast}
                    onRemove={removeToast}
                />
            ))}
        </div>,
        document.body
    );
}

export default ToastContainer;
