import { useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import styles from "./ReactionPicker.module.css";

const EMOJIS = ["❤️", "👍", "😂", "😮", "😢", "🙏", "🔥", "👏"];

function ReactionPicker({ onSelect, onClose, position }) {
    const pickerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target)) {
                onClose();
            }
        };

        const handleScroll = () => {
            onClose();
        };

        const handleEscape = (event) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        // Delay để tránh đóng ngay khi click
        const timeoutId = setTimeout(() => {
            document.addEventListener("mousedown", handleClickOutside);
            window.addEventListener("scroll", handleScroll, true);
            document.addEventListener("keydown", handleEscape);
        }, 100);

        return () => {
            clearTimeout(timeoutId);
            document.removeEventListener("mousedown", handleClickOutside);
            window.removeEventListener("scroll", handleScroll, true);
            document.removeEventListener("keydown", handleEscape);
        };
    }, [onClose]);

    // Chỉ render nếu có position hợp lệ
    if (!position || position.x === undefined || position.y === undefined) {
        return null;
    }

    const pickerContent = (
        <div
            ref={pickerRef}
            className={styles.picker}
            style={{
                left: `${position.x}px`,
                top: `${position.y}px`,
            }}
            onClick={(e) => e.stopPropagation()}
        >
            <div className={styles.header}>
                <span className={styles.title}>Chọn reaction</span>
                <button className={styles.closeButton} onClick={onClose}>
                    <X size={16} />
                </button>
            </div>
            <div className={styles.emojis}>
                {EMOJIS.map((emoji) => (
                    <button
                        key={emoji}
                        className={styles.emojiButton}
                        onClick={() => {
                            onSelect(emoji);
                            onClose();
                        }}
                        aria-label={`React with ${emoji}`}
                    >
                        <span>{emoji}</span>
                    </button>
                ))}
            </div>
        </div>
    );

    // Render vào body để tránh bị clip bởi overflow
    return createPortal(pickerContent, document.body);
}

export default ReactionPicker;

