import { Server as SocketServer } from "socket.io";
import Message from "../app/models/message.model.js";
import Group from "../app/models/group.model.js";

// Global io instance để dùng trong controllers
let globalIO = null;

/**
 * Cấu hình và khởi tạo Socket.IO server.
 *
 * Hàm này thiết lập các sự kiện kết nối, gửi tin nhắn, và ngắt kết nối cho Socket.IO.
 * Nó cũng cấu hình CORS để cho phép kết nối từ client.
 *
 * @param {http.Server} server - HTTP server để gắn Socket.IO.
 * @returns {SocketIO.Server} Instance của Socket.IO server đã được cấu hình.
 */
export const configureSocket = (server) => {
    const io = new SocketServer(server, {
        cors: {
            origin: process.env.FRONTEND_URL,
            credentials: true,
        },
    });

    // Store global io instance
    globalIO = io;

    const userSocketMap = new Map();

    // Helper function để emit group update đến tất cả members
    const emitToGroupMembers = async (groupId, event, data) => {
        try {
            const group = await Group.findById(groupId).lean();
            if (!group) return;

            const memberIds = group.members.map((m) => m.user.toString());
            memberIds.forEach((memberId) => {
                const socketId = userSocketMap.get(memberId);
                if (socketId) {
                    io.to(socketId).emit(event, data);
                }
            });
        } catch (err) {
            console.error(`❌ Lỗi khi emit ${event}:`, err.message);
        }
    };

    io.on("connection", (socket) => {
        const userId = socket.handshake.auth?.userId;

        if (userId) {
            userSocketMap.set(userId, socket.id);
            socket.userId = userId;
        }

        // Join group rooms khi user connect
        socket.on("joinGroups", async (groupIds) => {
            if (Array.isArray(groupIds)) {
                groupIds.forEach((groupId) => {
                    socket.join(`group:${groupId}`);
                });
            }
        });

        // Leave group room
        socket.on("leaveGroup", (groupId) => {
            socket.leave(`group:${groupId}`);
        });

        // Gửi tin nhắn 1-1
        socket.on("sendMessageTo", async ({ toUserId, message, type }) => {
            try {
                const saved = await Message.create({
                    from: socket.userId,
                    to: toUserId,
                    content: message,
                    type: type || "text",
                    isRead: false,
                });

                // Populate from field để có thông tin người gửi
                const populatedMessage = await Message.findById(saved._id)
                    .populate("from", "name email avatar")
                    .lean();

                const targetSocketId = userSocketMap.get(toUserId);
                const senderSocketId = userSocketMap.get(socket.userId);
                
                const messageData = {
                    _id: populatedMessage._id,
                    from: populatedMessage.from,
                    to: populatedMessage.to,
                    content: populatedMessage.content,
                    createdAt: populatedMessage.createdAt,
                    type: populatedMessage.type,
                    isRead: populatedMessage.isRead,
                    reactions: populatedMessage.reactions || [],
                };

                if (targetSocketId) {
                    io.to(targetSocketId).emit("receiveMessage", messageData);
                }
                if (senderSocketId) {
                    io.to(senderSocketId).emit("receiveMessage", messageData);
                }
            } catch (err) {
                console.error("❌ Lỗi khi lưu tin nhắn:", err.message);
            }
        });

        // Gửi tin nhắn vào group
        socket.on("sendMessageToGroup", async ({ groupId, message, type }) => {
            try {
                // Kiểm tra user có trong group không
                const group = await Group.findById(groupId);
                if (!group) {
                    return;
                }

                const isMember = group.members.some(
                    (m) => m.user.toString() === socket.userId.toString()
                );

                if (!isMember) {
                    return;
                }

                const saved = await Message.create({
                    from: socket.userId,
                    group: groupId,
                    content: message,
                    type: type || "text",
                    isRead: false,
                });

                // Populate from field để có thông tin người gửi
                const populatedMessage = await Message.findById(saved._id)
                    .populate("from", "name email avatar")
                    .lean();

                const messageData = {
                    _id: populatedMessage._id,
                    from: populatedMessage.from,
                    group: populatedMessage.group,
                    content: populatedMessage.content,
                    createdAt: populatedMessage.createdAt,
                    type: populatedMessage.type,
                    isRead: populatedMessage.isRead,
                    reactions: populatedMessage.reactions || [],
                };

                // Emit đến tất cả members trong group room
                io.to(`group:${groupId}`).emit("receiveGroupMessage", messageData);
            } catch (err) {
                console.error("❌ Lỗi khi lưu tin nhắn group:", err.message);
            }
        });

        socket.on("markAsRead", async ({ fromUserId }) => {
            try {
                await Message.updateMany(
                    { from: fromUserId, to: socket.userId, isRead: false },
                    { $set: { isRead: true } }
                );
            } catch (err) {
                console.error("❌ Lỗi khi đánh dấu đã đọc:", err.message);
            }
        });

        socket.on("addReaction", async ({ messageId, emoji }) => {
            try {
                const message = await Message.findById(messageId);
                if (!message) return;

                let reaction = message.reactions.find((r) => r.emoji === emoji);

                if (reaction) {
                    if (!reaction.users.includes(socket.userId)) {
                        reaction.users.push(socket.userId);
                    }
                } else {
                    message.reactions.push({
                        emoji,
                        users: [socket.userId],
                    });
                }

                await message.save();

                const updatedMessage = await Message.findById(messageId)
                    .populate("reactions.users", "name email")
                    .lean();

                const reactionData = {
                    messageId,
                    reactions: updatedMessage.reactions,
                };

                // Nếu là group message
                if (message.group) {
                    io.to(`group:${message.group}`).emit("reactionUpdated", reactionData);
                } else {
                    // 1-1 message
                    const targetSocketId = userSocketMap.get(message.to?.toString());
                    const senderSocketId = userSocketMap.get(message.from?.toString());
                    
                    if (targetSocketId) {
                        io.to(targetSocketId).emit("reactionUpdated", reactionData);
                    }
                    if (senderSocketId) {
                        io.to(senderSocketId).emit("reactionUpdated", reactionData);
                    }
                }
            } catch (err) {
                console.error("❌ Lỗi khi thêm reaction:", err.message);
            }
        });

        socket.on("removeReaction", async ({ messageId, emoji }) => {
            try {
                const message = await Message.findById(messageId);
                if (!message) return;

                const reaction = message.reactions.find((r) => r.emoji === emoji);

                if (reaction) {
                    reaction.users = reaction.users.filter(
                        (id) => id.toString() !== socket.userId.toString()
                    );

                    if (reaction.users.length === 0) {
                        message.reactions = message.reactions.filter(
                            (r) => r.emoji !== emoji
                        );
                    }
                }

                await message.save();

                const updatedMessage = await Message.findById(messageId)
                    .populate("reactions.users", "name email")
                    .lean();

                const reactionData = {
                    messageId,
                    reactions: updatedMessage.reactions,
                };

                // Nếu là group message
                if (message.group) {
                    io.to(`group:${message.group}`).emit("reactionUpdated", reactionData);
                } else {
                    // 1-1 message
                    const targetSocketId = userSocketMap.get(message.to?.toString());
                    const senderSocketId = userSocketMap.get(message.from?.toString());
                    
                    if (targetSocketId) {
                        io.to(targetSocketId).emit("reactionUpdated", reactionData);
                    }
                    if (senderSocketId) {
                        io.to(senderSocketId).emit("reactionUpdated", reactionData);
                    }
                }
            } catch (err) {
                console.error("❌ Lỗi khi xóa reaction:", err.message);
            }
        });

        socket.on("disconnect", () => {
            userSocketMap.delete(socket.userId);
        });
    });

    // Export helper function để dùng trong controllers
    io.emitToGroupMembers = async (groupId, event, data) => {
        try {
            const group = await Group.findById(groupId).lean();
            if (!group) return;

            const memberIds = group.members.map((m) => m.user.toString());
            memberIds.forEach((memberId) => {
                const socketId = userSocketMap.get(memberId);
                if (socketId) {
                    io.to(socketId).emit(event, data);
                }
            });
        } catch (err) {
            console.error(`❌ Lỗi khi emit ${event}:`, err.message);
        }
    };

    return io;
};

// Export function để emit group updates từ controllers
export const emitGroupUpdate = async (groupId, event, data) => {
    if (!globalIO) {
        console.warn("⚠️ Socket.IO chưa được khởi tạo");
        return;
    }

    try {
        const group = await Group.findById(groupId).lean();
        if (!group) return;

        const memberIds = group.members.map((m) => m.user.toString());
        
        // Emit to all sockets of members
        globalIO.sockets.sockets.forEach((socket) => {
            if (socket.userId && memberIds.includes(socket.userId.toString())) {
                socket.emit(event, data);
            }
        });
    } catch (err) {
        console.error(`❌ Lỗi khi emit ${event}:`, err.message);
    }
};

// Export function để emit đến specific user IDs (dùng khi group đã bị xóa)
export const emitToUsers = (userIds, event, data) => {
    if (!globalIO) {
        console.warn("⚠️ Socket.IO chưa được khởi tạo");
        return;
    }

    const userIdStrings = userIds.map((id) => id.toString());
    
    globalIO.sockets.sockets.forEach((socket) => {
        if (socket.userId && userIdStrings.includes(socket.userId.toString())) {
            socket.emit(event, data);
        }
    });
};
