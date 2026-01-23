import { useCallback, useEffect, useRef } from "react";
import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

import { getProfile } from "../../services/userServices";
import { getFriends } from "../../services/friendService";
import { getMyGroups } from "../../services/groupService";
import socket from "../../socket";
import { getMessages } from "../../services/messageService";
import FriendList from "./components/FriendList";
import ChatHeader from "./components/ChatHeader/ChatHeader";
import MessageList from "./components/MessageList/MessageList";
import MessageInput from "./components/MessageInput/MessageInput";
import Loading from "../../components/Loading";
import { uploadImage, uploadVideo } from "../../services/uploadService";
import useToastActions from "../../hooks/useToastActions";

import styles from "./ChatPage.module.css";
import constants from "../../constants";
import { ChatRefContext } from "../../contexts/AppContext";

export default function ChatPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const chatRef = useRef(null);
    const scrollToBottom = useRef(true);
    const notificationSoundRef = useRef(null);

    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [currentUserId, setCurrentUserId] = useState("");
    const [recipientId, setRecipientId] = useState("");
    const [groupId, setGroupId] = useState(null);
    const [friends, setFriends] = useState([]);
    const [groups, setGroups] = useState([]);
    const [selectedFriend, setSelectedFriend] = useState(null);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [loadingMore, setLoadingMore] = useState(false);
    const [loading, setLoading] = useState(false);
    const [unreadMessages, setUnreadMessages] = useState({});

    const toast = useToastActions();

    useEffect(() => {
        let isMounted = true;

        const fetchCurrentUser = async () => {
            try {
                const response = await getProfile();

                if (isMounted && response && response._id) {
                    setCurrentUserId(response._id);
                    socket.auth = { userId: response._id };
                    
                    // Nếu socket chưa kết nối, kết nối
                    if (!socket.connected) {
                        socket.connect();
                    }
                }
            } catch (err) {
                console.log("Error fetching current user:", err);
            }
        };

        const fetchFriends = async () => {
            try {
                const response = await getFriends();
                if (isMounted && response) {
                    const users = response.map((f) => f.user || {});
                    setFriends(users);
                }
            } catch (err) {
                console.log(err);
            }
        };

        const fetchGroups = async () => {
            try {
                const response = await getMyGroups();
                if (isMounted) {
                    const groupsList = Array.isArray(response) ? response : [];
                    setGroups(groupsList);
                    // Join group rooms - đợi socket connect nếu chưa connected
                    const groupIds = groupsList.map((g) => g._id);
                    if (groupIds.length > 0) {
                        if (socket.connected) {
                            socket.emit("joinGroups", groupIds);
                        } else {
                            // Đợi socket connect rồi mới join
                            const waitForConnect = () => {
                                if (socket.connected) {
                                    socket.emit("joinGroups", groupIds);
                                } else {
                                    socket.once("connect", () => {
                                        socket.emit("joinGroups", groupIds);
                                    });
                                }
                            };
                            waitForConnect();
                        }
                    }
                }
            } catch (err) {
                console.error("Error fetching groups:", err);
                if (isMounted) {
                    setGroups([]);
                }
            }
        };

        // Chỉ set loading cho lần đầu tiên
        if (!currentUserId) {
            setLoading(true);
            fetchCurrentUser().finally(() => {
                if (isMounted) {
                    setLoading(false);
                }
            });
        } else {
            fetchCurrentUser();
        }
        
        fetchFriends();
        fetchGroups();

        // Listen for refresh groups event
        const handleRefreshGroups = () => {
            console.log("Refreshing groups...");
            fetchGroups();
        };
        window.addEventListener("refreshGroups", handleRefreshGroups);

        return () => {
            isMounted = false;
            window.removeEventListener("refreshGroups", handleRefreshGroups);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Listen for real-time group updates
    useEffect(() => {
        const handleGroupCreated = (data) => {
            console.log("Group created:", data);
            // Refresh groups list
            getMyGroups().then((response) => {
                const groupsList = Array.isArray(response) ? response : [];
                setGroups(groupsList);
                // Join new group room
                if (data.group?._id && socket.connected) {
                    socket.emit("joinGroups", [data.group._id]);
                }
            });
        };

        const handleAddedToGroup = (data) => {
            console.log("Added to group:", data);
            // User was added to a group, refresh groups list
            getMyGroups().then((response) => {
                const groupsList = Array.isArray(response) ? response : [];
                setGroups(groupsList);
                // Join new group room
                if (data.group?._id && socket.connected) {
                    socket.emit("joinGroups", [data.group._id]);
                }
            });
        };

        const handleGroupUpdated = (data) => {
            console.log("Group updated:", data);
            // Update groups list
            setGroups((prev) => {
                const updated = prev.map((g) => 
                    g._id === data.group?._id ? data.group : g
                );
                // If group not in list, add it
                if (data.group?._id && !prev.find((g) => g._id === data.group._id)) {
                    return [...updated, data.group];
                }
                return updated;
            });
            
            // Update selected group if it's the current one
            if (groupId === data.group?._id) {
                setSelectedGroup(data.group);
            }
        };

        const handleMembersAdded = (data) => {
            console.log("Members added:", data);
            handleGroupUpdated(data);
        };

        const handleMemberRemoved = (data) => {
            console.log("Member removed:", data);
            handleGroupUpdated(data);
        };

        const handleGroupDeleted = (data) => {
            console.log("Group deleted:", data);
            // Remove group from list
            setGroups((prev) => prev.filter((g) => g._id !== data.groupId));
            
            // If current group is deleted, navigate away
            if (groupId === data.groupId) {
                setGroupId(null);
                setSelectedGroup(null);
                navigate("/chat", { replace: true });
            }
        };

        const handleGroupLeft = (data) => {
            console.log("Left group:", data);
            // Remove group from list when user leaves
            setGroups((prev) => prev.filter((g) => g._id !== data.groupId));
            
            // If current group is left, navigate away
            if (groupId === data.groupId) {
                setGroupId(null);
                setSelectedGroup(null);
                navigate("/chat", { replace: true });
            }
        };

        socket.on("groupCreated", handleGroupCreated);
        socket.on("groupUpdated", handleGroupUpdated);
        socket.on("membersAdded", handleMembersAdded);
        socket.on("memberRemoved", handleMemberRemoved);
        socket.on("groupDeleted", handleGroupDeleted);
        socket.on("groupLeft", handleGroupLeft);
        socket.on("addedToGroup", handleAddedToGroup);

        return () => {
            socket.off("groupCreated", handleGroupCreated);
            socket.off("groupUpdated", handleGroupUpdated);
            socket.off("membersAdded", handleMembersAdded);
            socket.off("memberRemoved", handleMemberRemoved);
            socket.off("groupDeleted", handleGroupDeleted);
            socket.off("groupLeft", handleGroupLeft);
            socket.off("addedToGroup", handleAddedToGroup);
        };
    }, [groupId, navigate]);

    // Join groups when socket connects
    useEffect(() => {
        const handleConnect = () => {
            console.log("Socket connected, joining groups...");
            if (groups.length > 0) {
                const groupIds = groups.map((g) => g._id);
                socket.emit("joinGroups", groupIds);
            }
            // Join current group if exists
            if (groupId) {
                socket.emit("joinGroups", [groupId]);
            }
        };

        const handleDisconnect = () => {
            console.log("Socket disconnected");
        };

        // Nếu đã connected, join ngay
        if (socket.connected) {
            handleConnect();
        }

        socket.on("connect", handleConnect);
        socket.on("disconnect", handleDisconnect);

        return () => {
            socket.off("connect", handleConnect);
            socket.off("disconnect", handleDisconnect);
        };
    }, [groups, groupId]);

    // Join groups when groups list changes (socket must be connected)
    useEffect(() => {
        if (socket.connected && groups.length > 0) {
            const groupIds = groups.map((g) => g._id);
            socket.emit("joinGroups", groupIds);
        }
    }, [groups]);
    
    // Join current group room when groupId changes (socket must be connected)
    useEffect(() => {
        if (socket.connected && groupId) {
            socket.emit("joinGroups", [groupId]);
        }
    }, [groupId]);

    // Load groupId from URL params
    useEffect(() => {
        const urlGroupId = searchParams.get("groupId");
        const urlRecipientId = searchParams.get("userId");
        
        // If URL has groupId, switch to group chat
        if (urlGroupId) {
            if (urlGroupId !== groupId) {
                setGroupId(urlGroupId);
                setRecipientId(""); // Clear recipientId when switching to group
                setSelectedFriend(null);
                
                // Đảm bảo join group room khi load từ URL
                if (socket.connected && urlGroupId) {
                    socket.emit("joinGroups", [urlGroupId]);
                }
                
                // Try to find group in current list, if not found, refresh groups
                const group = groups.find((g) => g._id === urlGroupId);
                if (group) {
                    setSelectedGroup(group);
                } else {
                    // Group not found, refresh groups list
                    getMyGroups().then((response) => {
                        const groupsList = Array.isArray(response) ? response : [];
                        setGroups(groupsList);
                        const foundGroup = groupsList.find((g) => g._id === urlGroupId);
                        if (foundGroup) {
                            setSelectedGroup(foundGroup);
                        }
                        // Join group room sau khi refresh
                        if (socket.connected && urlGroupId) {
                            socket.emit("joinGroups", [urlGroupId]);
                        }
                    }).catch((err) => {
                        console.error("Error refreshing groups:", err);
                    });
                }
            }
        } 
        // If URL has userId (recipientId), switch to 1-1 chat
        else if (urlRecipientId) {
            if (urlRecipientId !== recipientId) {
                setRecipientId(urlRecipientId);
                setGroupId(null);
                setSelectedGroup(null);
            }
        }
        // If URL has no groupId and no userId, clear group if it's set
        else {
            if (groupId) {
                setGroupId(null);
                setSelectedGroup(null);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams, groups]);

    useEffect(() => {
        let isMounted = true;
        
        const fetchMessage = async () => {
            // Don't fetch if both are empty (initial state)
            if (!groupId && !recipientId) {
                if (isMounted) {
                    setMessages([]);
                    setSelectedFriend(null);
                    setSelectedGroup(null);
                }
                return;
            }

            // Chỉ hiển thị loading nếu chưa có messages (lần đầu load)
            const shouldShowLoading = messages.length === 0;
            if (shouldShowLoading && isMounted) {
                setLoading(true);
            }

            try {
                if (groupId) {
                    // Load group messages
                    const response = await getMessages(null, null, 20, groupId);
                    if (isMounted && response) {
                        setMessages(response);
                        const group = groups.find((g) => g._id === groupId);
                        if (group) {
                            setSelectedGroup(group);
                        }
                        setSelectedFriend(null);
                    }
                } else if (recipientId) {
                    // Load 1-1 messages
                    const response = await getMessages(recipientId);
                    if (isMounted && response) {
                        setMessages(response);
                        const friend = friends.find((f) => f._id === recipientId);
                        if (friend) {
                            setSelectedFriend(friend);
                        }
                        setSelectedGroup(null);
                    }
                }
            } catch (err) {
                console.log(err);
            } finally {
                if (isMounted && shouldShowLoading) {
                    setLoading(false);
                }
            }
        };
        
        fetchMessage();
        
        return () => {
            isMounted = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [friends, groups, recipientId, groupId]);

    useEffect(() => {
        const handleReceiveMessage = (data) => {
            const fromId = data.from?._id || data.from;
            const toId = data.to?._id || data.to;
            
            // 1-1 message
            if (data.to && !data.group) {
                // Nếu là tin nhắn trong cuộc trò chuyện hiện tại
                if (
                    (fromId === recipientId && toId === currentUserId) ||
                    (fromId === currentUserId && toId === recipientId)
                ) {
                    setMessages((prev) => {
                        // Kiểm tra xem có tin nhắn tạm (temp) không, nếu có thì thay thế
                        const tempIndex = prev.findIndex((msg) => 
                            msg._id?.startsWith("temp-") && 
                            (msg.from?._id || msg.from) === (data.from?._id || data.from) &&
                            msg.content === data.content &&
                            msg.type === data.type
                        );
                        
                        if (tempIndex !== -1) {
                            // Thay thế tin nhắn tạm bằng tin nhắn thật từ server
                            const newMessages = [...prev];
                            newMessages[tempIndex] = data;
                            return newMessages;
                        }
                        
                        // Nếu không có tin nhắn tạm, kiểm tra xem đã tồn tại chưa
                        const exists = prev.some((msg) => msg._id === data._id);
                        if (exists) return prev;
                        return [...prev, data];
                    });
                    
                    if (fromId === recipientId) {
                        socket.emit("markAsRead", { fromUserId: fromId });
                    }
                } else if (fromId !== currentUserId) {
                    // Tin nhắn từ người khác
                    setUnreadMessages((prev) => ({
                        ...prev,
                        [fromId]: (prev[fromId] || 0) + 1,
                    }));

                    if (notificationSoundRef.current) {
                        notificationSoundRef.current.currentTime = 0;
                        notificationSoundRef.current.play().catch((err) => {
                            console.warn("Không thể phát âm thanh:", err);
                        });
                    }
                }
            }
        };

        const handleReceiveGroupMessage = (data) => {
            console.log("📨 Received group message:", data);
            
            // Helper function để lấy group ID (xử lý cả object và ObjectId)
            const getGroupId = (groupData) => {
                if (!groupData) return null;
                if (typeof groupData === 'object' && groupData._id) {
                    return groupData._id.toString();
                }
                return groupData.toString();
            };
            
            const messageGroupId = getGroupId(data.group);
            const currentGroupId = groupId ? groupId.toString() : null;
            
            console.log("🔍 Message groupId:", messageGroupId, "Current groupId:", currentGroupId, "Match:", messageGroupId === currentGroupId);
            
            // Nếu là tin nhắn trong group hiện tại
            if (messageGroupId && currentGroupId && messageGroupId === currentGroupId) {
                setMessages((prev) => {
                    // Helper function để lấy from ID (xử lý cả object và ObjectId)
                    const getFromId = (msg) => {
                        if (!msg || !msg.from) return null;
                        if (typeof msg.from === 'object' && msg.from._id) {
                            return msg.from._id.toString();
                        }
                        if (typeof msg.from === 'object' && !msg.from._id) {
                            return null;
                        }
                        return msg.from.toString();
                    };
                    
                    const dataFromId = getFromId(data);
                    const currentUserIdStr = currentUserId ? currentUserId.toString() : null;
                    
                    // Kiểm tra xem có tin nhắn tạm (temp) không, nếu có thì thay thế
                    // Tin nhắn tạm có from là currentUserId (string), cần so sánh với data.from._id
                    const tempIndex = prev.findIndex((msg) => {
                        if (!msg._id?.startsWith("temp-")) return false;
                        
                        const msgFromId = getFromId(msg);
                        // So sánh: nếu temp message có from là currentUserId và data.from._id cũng là currentUserId
                        const isFromCurrentUser = (msgFromId === currentUserIdStr) && (dataFromId === currentUserIdStr);
                        // Hoặc so sánh trực tiếp nếu cả hai đều có ID
                        const fromMatches = msgFromId && dataFromId && msgFromId === dataFromId;
                        
                        return (isFromCurrentUser || fromMatches) &&
                            msg.content === data.content &&
                            (msg.type || "text") === (data.type || "text");
                    });
                    
                    if (tempIndex !== -1) {
                        // Thay thế tin nhắn tạm bằng tin nhắn thật từ server
                        const newMessages = [...prev];
                        newMessages[tempIndex] = data;
                        return newMessages;
                    }
                    
                    // Nếu không có tin nhắn tạm, kiểm tra xem đã tồn tại chưa
                    const exists = prev.some((msg) => msg._id === data._id);
                    if (exists) return prev;
                    return [...prev, data];
                });
                
                scrollToBottom.current = true;
                socket.emit("markAsRead", { groupId: messageGroupId });
            } else if (messageGroupId) {
                // Tin nhắn từ group khác
                setUnreadMessages((prev) => ({
                    ...prev,
                    [`group:${messageGroupId}`]: (prev[`group:${messageGroupId}`] || 0) + 1,
                }));

                if (notificationSoundRef.current) {
                    notificationSoundRef.current.currentTime = 0;
                    notificationSoundRef.current.play().catch((err) => {
                        console.warn("Không thể phát âm thanh:", err);
                    });
                }
            }
        };

        socket.on("receiveMessage", handleReceiveMessage);
        socket.on("receiveGroupMessage", handleReceiveGroupMessage);

        return () => {
            socket.off("receiveMessage", handleReceiveMessage);
            socket.off("receiveGroupMessage", handleReceiveGroupMessage);
        };
    }, [recipientId, groupId, currentUserId]);

    useEffect(() => {
        const unreadCount = Object.values(unreadMessages).reduce(
            (a, b) => a + b,
            0
        );
        document.title =
            unreadCount > 0
                ? `(${
                      unreadCount > 99
                          ? "99+"
                          : unreadCount > 9
                          ? "9+"
                          : unreadCount
                  }) Tin nhắn mới`
                : constants.APP_NAME;
    }, [unreadMessages]);

    useEffect(() => {
        if (scrollToBottom.current && chatRef.current) {
            chatRef.current.scrollTop = chatRef.current.scrollHeight;
        }
    }, [messages]);

    const loadMessages = useCallback(
        async (append = false) => {
            try {
                const el = chatRef.current;
                const prevScrollHeight = el?.scrollHeight || 0;

                const before =
                    append && messages.length > 0
                        ? messages[0].createdAt
                        : undefined;

                const response = groupId
                    ? await getMessages(null, before, 20, groupId)
                    : await getMessages(recipientId, before);

                if (append) {
                    scrollToBottom.current = false;
                } else {
                    scrollToBottom.current = true;
                }

                setMessages((prev) =>
                    append ? [...response, ...prev] : response
                );

                if (append && el && response.length > 0) {
                    setTimeout(() => {
                        const newScrollHeight = el.scrollHeight;
                        const scrollDiff = newScrollHeight - prevScrollHeight;
                        el.scrollTop = scrollDiff;
                    }, 0);
                } else if (!append && el) {
                    setTimeout(() => {
                        el.scrollTop = el.scrollHeight;
                    }, 0);
                }
            } catch (err) {
                console.log(err);
            } finally {
                setLoadingMore(false);
            }
        },
        [messages, recipientId, groupId]
    );

    const handleScroll = async () => {
        const el = chatRef.current;
        if (!el) {
            return;
        }

        if (el.scrollTop === 0 && !loadingMore) {
            setLoadingMore(true);
            await loadMessages(true);
        }
    };

    const handleFileUpload = async (file, fileType) => {
        if (!file || (!recipientId && !groupId)) {
            return;
        }

        try {
            let response = null;
            switch (fileType) {
                case "image": {
                    response = await uploadImage(file);
                    break;
                }
                case "video": {
                    response = await uploadVideo(file);
                    break;
                }
                default: {
                    response = null;
                    break;
                }
            }

            if (!response) {
                throw new Error("Tải lên thất bại!");
            }

            const fileUrl = response.url;

            // Optimistic update: thêm tin nhắn file vào state ngay lập tức
            const tempMessage = {
                _id: `temp-${Date.now()}`,
                from: currentUserId,
                to: recipientId || undefined,
                group: groupId || undefined,
                content: fileUrl,
                type: fileType,
                createdAt: new Date().toISOString(),
                isRead: false,
                reactions: [],
            };

            // Thêm tin nhắn tạm vào state
            setMessages((prev) => [...prev, tempMessage]);
            scrollToBottom.current = true;

            // Gửi tin nhắn qua socket
            if (groupId) {
                socket.emit("sendMessageToGroup", {
                    groupId,
                    message: fileUrl,
                    type: fileType,
                });
            } else {
                socket.emit("sendMessageTo", {
                    toUserId: recipientId,
                    message: fileUrl,
                    type: fileType,
                });
            }
        } catch (err) {
            toast.error(err.message, "Lỗi hệ thống", {
                duration: 6000,
            });
        }
    };

    const handleSend = async (file, fileType) => {
        if (file && fileType && (recipientId || groupId)) {
            await handleFileUpload(file, fileType);
        }

        if (!message || (!recipientId && !groupId)) {
            return;
        }

        // Optimistic update: thêm tin nhắn vào state ngay lập tức
        const tempMessage = {
            _id: `temp-${Date.now()}`,
            from: currentUserId,
            to: recipientId || undefined,
            group: groupId || undefined,
            content: message,
            type: "text",
            createdAt: new Date().toISOString(),
            isRead: false,
            reactions: [],
        };

        // Thêm tin nhắn tạm vào state
        setMessages((prev) => [...prev, tempMessage]);
        scrollToBottom.current = true;

        // Gửi tin nhắn qua socket
        if (groupId) {
            socket.emit("sendMessageToGroup", {
                groupId,
                message,
                type: "text",
            });
        } else {
            socket.emit("sendMessageTo", {
                toUserId: recipientId,
                message,
                type: "text",
            });
        }

        setMessage("");
    };

    // Chỉ hiển thị full screen loading khi chưa có currentUserId (lần đầu load)
    if (loading && !currentUserId) {
        return <Loading fullScreen={true} text="Đang tải..." />;
    }

    return (
        <ChatRefContext.Provider value={{ chatRef, scrollToBottom }}>
            <div className={styles["chat-container"]}>
                <div className={styles["chat-sidebar"]}>
                    <FriendList
                        friends={friends}
                        groups={groups}
                        recipientId={recipientId}
                        groupId={groupId}
                        unreadMessages={unreadMessages}
                        onSelectFriend={(id) => {
                            // Clear group state first
                            setGroupId(null);
                            setSelectedGroup(null);
                            // Then set friend state
                            setRecipientId(id);
                            scrollToBottom.current = true;
                            navigate(`/chat?userId=${id}`, { replace: true });

                            socket.emit("markAsRead", { fromUserId: id });
                            setUnreadMessages((prev) => {
                                const updated = { ...prev };
                                delete updated[id];
                                return updated;
                            });
                        }}
                        onSelectGroup={(id) => {
                            setGroupId(id);
                            setRecipientId("");
                            scrollToBottom.current = true;
                            navigate(`/chat?groupId=${id}`, { replace: true });

                            // Đảm bảo join group room khi chọn group
                            if (socket.connected && id) {
                                socket.emit("joinGroups", [id]);
                            }

                            setUnreadMessages((prev) => {
                                const updated = { ...prev };
                                delete updated[`group:${id}`];
                                return updated;
                            });
                        }}
                    />
                </div>

                <div className={styles["chat-main"]}>
                    {!recipientId && !groupId ? (
                        <div className={styles["select-friend-prompt"]}>
                            <div className={styles["prompt-icon"]}>💬</div>
                            <h2>Chọn một người bạn hoặc nhóm để bắt đầu trò chuyện</h2>
                        </div>
                    ) : (
                        <>
                            <ChatHeader friend={selectedFriend} group={selectedGroup} />

                            <MessageList
                                ref={chatRef}
                                onScroll={handleScroll}
                                messages={messages}
                                currentUserId={currentUserId}
                                loadingMore={loadingMore}
                                isGroupChat={!!groupId}
                            />

                            <MessageInput
                                message={message}
                                onChange={setMessage}
                                onSend={handleSend}
                            />
                        </>
                    )}
                </div>
            </div>
            <audio
                ref={notificationSoundRef}
                src="/sounds/notification.mp3"
                preload="auto"
            />
        </ChatRefContext.Provider>
    );
}

