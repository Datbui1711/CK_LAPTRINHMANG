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
            required: false, // Không required nếu là group message
        },
        group: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Group",
            required: false, // Không required nếu là 1-1 message
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
        reactions: [
            {
                emoji: {
                    type: String,
                    required: true,
                },
                users: [
                    {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "User",
                    },
                ],
            },
        ],
    },
    { timestamps: true }
);

// Validation: phải có to hoặc group
messageSchema.pre("validate", function (next) {
    if (!this.to && !this.group) {
        return next(new Error("Message must have either 'to' (1-1) or 'group' (group chat)"));
    }
    if (this.to && this.group) {
        return next(new Error("Message cannot have both 'to' and 'group'"));
    }
    next();
});

// Index để tìm kiếm nhanh
messageSchema.index({ to: 1, createdAt: -1 });
messageSchema.index({ group: 1, createdAt: -1 });
messageSchema.index({ from: 1 });

const Message = mongoose.model("Message", messageSchema);
export default Message;
