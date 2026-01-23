import { useEffect, useState } from "react";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";

import styles from "./ToastItem.module.css";

function ToastItem({ toast, onRemove }) {
    const [isVisible, setIsVisible] = useState(false);
    const [isRemoving, setIsRemoving] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 10);
        return () => clearTimeout(timer);
    }, []);

    const handleRemove = () => {
        setIsRemoving(true);
        setTimeout(() => {
            onRemove(toast.id);
        }, 300);
    };

    const getIcon = () => {
        switch (toast.type) {
            case "success":
                return <CheckCircle size={20} />;
            case "error":
                return <XCircle size={20} />;
            case "warning":
                return <AlertTriangle size={20} />;
            case "info":
                return <Info size={20} />;
            default:
                return <Info size={20} />;
        }
    };

    return (
        <div
            className={`${styles["toast-item"]} ${
                styles[`toast-${toast.type}`]
            } ${isVisible && !isRemoving ? styles["toast-enter"] : ""} ${
                isRemoving ? styles["toast-exit"] : ""
            }`}
            role="alert"
            aria-live="polite"
        >
            <div className={styles["toast-icon"]}>{getIcon()}</div>

            <div className={styles["toast-content"]}>
                {toast.title && (
                    <div className={styles["toast-title"]}>{toast.title}</div>
                )}
                <div className={styles["toast-message"]}>{toast.message}</div>
            </div>

            {toast.dismissible && (
                <button
                    className={styles["toast-close"]}
                    onClick={handleRemove}
                    aria-label="Đóng thông báo"
                >
                    <X size={16} />
                </button>
            )}
        </div>
    );
}

export default ToastItem;
