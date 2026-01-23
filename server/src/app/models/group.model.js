import mongoose from "mongoose";

const groupSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            default: "",
        },
        avatar: {
            type: String,
            default: "",
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        admins: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        members: [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                    required: true,
                },
                joinedAt: {
                    type: Date,
                    default: Date.now,
                },
                role: {
                    type: String,
                    enum: ["member", "admin"],
                    default: "member",
                },
            },
        ],
        settings: {
            isPublic: {
                type: Boolean,
                default: false,
            },
            allowMemberInvite: {
                type: Boolean,
                default: true,
            },
            maxMembers: {
                type: Number,
                default: 100,
            },
        },
    },
    { timestamps: true }
);

// Index để tìm kiếm nhanh
groupSchema.index({ "members.user": 1 });
groupSchema.index({ createdBy: 1 });

const Group = mongoose.model("Group", groupSchema);
export default Group;

