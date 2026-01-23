import { useRef, useState } from "react";
import { Send, ImageIcon, Paperclip, X, Play } from "lucide-react";

import { getFileSize } from "../../../../utils/helper";

import styles from "./MessageInput.module.css";

function MessageInput({ message, onChange, onSend }) {
    const imageInputRef = useRef(null);
    const fileInputRef = useRef(null);

    const [selectedFile, setSelectedFile] = useState(null);
    const [filePreview, setFilePreview] = useState(null);
    const [fileType, setFileType] = useState(null);

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleFileSelect = (e) => {
        if (!e.target.files || !e.target.files[0]) {
            return;
        }

        const file = e.target.files[0];
        setSelectedFile(file);
        const type = file.type;

        if (type.startsWith("image/")) {
            setFilePreview(URL.createObjectURL(file));
            setFileType("image");
        } else if (type.startsWith("video/")) {
            setFilePreview(URL.createObjectURL(file));
            setFileType("video");
        } else {
            setFilePreview(null);
            setFileType("file");
        }
    };

    const openImageSelector = () => {
        if (imageInputRef.current) {
            imageInputRef.current.click();
        }
    };

    const openFileSelector = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const clearFileSelection = () => {
        if (filePreview) {
            URL.revokeObjectURL(filePreview);
        }
        setSelectedFile(null);
        setFilePreview(null);
        setFileType(null);
        if (imageInputRef.current) {
            imageInputRef.current.value = "";
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleSend = async () => {
        if ((!message.trim() && !selectedFile) || onSend === undefined) {
            return;
        }

        await onSend(selectedFile || undefined, fileType || undefined);
        onChange("");
        clearFileSelection();
    };

    const getFileIcon = (fileName) => {
        const extension = fileName.split(".").pop()?.toLowerCase();

        if (["pdf"].includes(extension)) {
            return <FileText size={24} color="#e74c3c" />;
        } else if (["doc", "docx"].includes(extension)) {
            return <FileText size={24} color="#2980b9" />;
        } else if (["xls", "xlsx"].includes(extension)) {
            return <FileText size={24} color="#27ae60" />;
        } else if (["ppt", "pptx"].includes(extension)) {
            return <FileText size={24} color="#f39c12" />;
        } else if (["txt"].includes(extension)) {
            return <FileText size={24} color="#7f8c8d" />;
        } else {
            return <FileText size={24} color="#95a5a6" />;
        }
    };

    return (
        <div className={styles["chat-input-container"]}>
            {(filePreview || (selectedFile && fileType === "file")) && (
                <div className={styles["file-preview-container"]}>
                    <div className={styles["file-preview-wrapper"]}>
                        {fileType === "image" && filePreview && (
                            <img
                                src={filePreview || "/placeholder.svg"}
                                alt="Preview"
                                className={`${styles["file-preview"]} ${styles["image-preview"]}`}
                            />
                        )}

                        {fileType === "video" && filePreview && (
                            <div className={styles["video-preview-container"]}>
                                <video
                                    src={filePreview}
                                    className={`${styles["file-preview"]} ${styles["video-preview"]}`}
                                    controls
                                    preload="metadata"
                                />
                                <div className={styles["video-info"]}>
                                    <Play size={16} />
                                    <span className={styles["video-size"]}>
                                        {selectedFile &&
                                            getFileSize(selectedFile.size)}
                                    </span>
                                </div>
                            </div>
                        )}

                        {fileType === "file" && selectedFile && (
                            <div className={styles["file-info-container"]}>
                                <div className={styles["file-icon"]}>
                                    {getFileIcon(selectedFile.name)}
                                </div>
                                <div className={styles["file-details"]}>
                                    <div className={styles["file-name"]}>
                                        {selectedFile.name}
                                    </div>
                                    <div className={styles["file-size"]}>
                                        {getFileSize(selectedFile.size)}
                                    </div>
                                </div>
                            </div>
                        )}

                        <button
                            className={styles["remove-file-button"]}
                            onClick={clearFileSelection}
                            aria-label="Remove file"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>
            )}

            <div className={styles["input-controls"]}>
                <button
                    className={styles["image-button"]}
                    onClick={openImageSelector}
                    aria-label="Add image"
                    title="Thêm hình ảnh"
                >
                    <ImageIcon size={20} />
                </button>

                <button
                    className={styles["file-button"]}
                    onClick={openFileSelector}
                    aria-label="Add file or video"
                    title="Thêm file hoặc video"
                >
                    <Paperclip size={20} />
                </button>

                <textarea
                    className={styles["chat-input"]}
                    placeholder="Nhập tin nhắn..."
                    value={message}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyDown={handleKeyPress}
                />

                <input
                    type="file"
                    ref={imageInputRef}
                    onChange={handleFileSelect}
                    accept="image/*"
                    className={styles["file-input"]}
                />

                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept="video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar"
                    className={styles["file-input"]}
                />

                <button
                    className={styles["send-button"]}
                    onClick={handleSend}
                    disabled={!message.trim() && !selectedFile}
                    aria-label="Send message"
                >
                    <Send size={20} />
                </button>
            </div>
        </div>
    );
}

export default MessageInput;
