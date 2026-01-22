import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
    {
        from: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        to: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: function () {
                return !this.isGroup;
            },
        },
        groupId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Group",
            required: function () {
                return this.isGroup;
            },
        },
        isGroup: {
            type: Boolean,
            default: false,
        },
        content: { type: String, required: true },
        type: {
            type: String,
            enum: ["text", "image", "video", "file"],
            default: "text",
        },
        isRead: {
            type: Boolean,
            default: false,
        },
        readBy: [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                },
                readAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
    },
    { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);
export default Message;
