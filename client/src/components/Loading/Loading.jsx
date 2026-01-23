import { useEffect, useState } from "react";
import styles from "./Loading.module.css";

function Loading({
    type = "spinner",
    size = "medium",
    color = "primary",
    text = "",
    fullScreen = false,
    delay = 0,
}) {
    const [show, setShow] = useState(delay === 0);

    useEffect(() => {
        if (delay > 0) {
            const timer = setTimeout(() => setShow(true), delay);
            return () => clearTimeout(timer);
        }
    }, [delay]);

    if (!show) return null;

    const renderLoadingIndicator = () => {
        const classes = `${styles[type] || ""} ${styles[size] || ""} ${
            styles[color] || ""
        }`;
        switch (type) {
            case "dots":
                return (
                    <div className={classes}>
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                    </div>
                );
            case "pulse":
                return (
                    <div className={classes}>
                        <div></div>
                        <div></div>
                    </div>
                );
            case "wave":
                return (
                    <div className={classes}>
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                    </div>
                );
            case "ring":
                return (
                    <div className={classes}>
                        <div></div>
                        <div></div>
                        <div></div>
                    </div>
                );
            case "spinner":
            default:
                return (
                    <div className={classes}>
                        {[...Array(12)].map((_, i) => (
                            <div key={i}></div>
                        ))}
                    </div>
                );
        }
    };

    const loadingContent = (
        <div className={styles.loadingContainer}>
            {renderLoadingIndicator()}
            {text && <p className={styles.loadingText}>{text}</p>}
        </div>
    );

    if (fullScreen) {
        return <div className={styles.fullScreenOverlay}>{loadingContent}</div>;
    }

    return loadingContent;
}

export default Loading;
