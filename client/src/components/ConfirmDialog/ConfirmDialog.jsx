import { useEffect } from "react";
import { createPortal } from "react-dom";

import styles from "./ConfirmDialog.module.css";

function ConfirmDialog({
    isOpen,
    title,
    message,
    confirmText = "Xác nhận",
    cancelText = "Hủy",
    onConfirm,
    onCancel,
    variant = "info",
}) {
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === "Escape") {
                onCancel();
            }
        };

        if (isOpen) {
            document.addEventListener("keydown", handleEscape);
            document.body.style.overflow = "hidden";
        }

        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = "unset";
        };
    }, [isOpen, onCancel]);

    if (!isOpen) {
        return null;
    }

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onCancel();
        }
    };

    const dialogContent = (
        <div className={styles.backdrop} onClick={handleBackdropClick}>
            <div className={`${styles.dialog} ${styles[variant]}`}>
                <div className={styles.header}>
                    <h3 className={styles.title}>{title}</h3>
                </div>

                <div className={styles.body}>
                    <p className={styles.message}>{message}</p>
                </div>

                <div className={styles.footer}>
                    <button
                        className={styles.cancelButton}
                        onClick={onCancel}
                        type="button"
                    >
                        {cancelText}
                    </button>
                    <button
                        className={`${styles.confirmButton} ${
                            styles[
                                `confirm${
                                    variant.charAt(0).toUpperCase() +
                                    variant.slice(1)
                                }`
                            ]
                        }`}
                        onClick={onConfirm}
                        type="button"
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );

    return createPortal(dialogContent, document.body);
}

export default ConfirmDialog;
