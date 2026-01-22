import User from "../models/user.model.js";

export const getFriends = async (req, res) => {
    try {
        const user = await User.findById(req.userId)
            .populate("friends.user", "_id name email avatar")
            .select("friends");

        if (!user)
            return res.status(404).json({ error: "Không tìm thấy user" });

        res.json(user.friends);
    } catch (err) {
        res.status(500).json({ error: "Lỗi khi lấy danh sách bạn bè" });
    }
};

export const getFriendRequests = async (req, res) => {
    try {
        const user = await User.findById(req.userId)
            .populate("friendRequests.user", "_id name email avatar")
            .select("friendRequests");

        res.json(user.friendRequests);
    } catch (err) {
        res.status(500).json({
            error: "Lỗi khi lấy danh sách lời mời kết bạn",
        });
    }
};

export const searchUsersToAddFriend = async (req, res) => {
    try {
        const keyword = req.query.email?.trim();
        const userId = req.userId;

        if (!keyword) {
            return res.status(400).json({ error: "Thiếu từ khóa email" });
        }

        const currentUser = await User.findById(userId).select(
            "friends friendRequests sentRequests"
        );

        if (!currentUser) {
            return res
                .status(404)
                .json({ error: "Không tìm thấy người dùng hiện tại" });
        }

        const friends = new Set(
            currentUser.friends.map((f) => f.user.toString())
        );

        const sentRequests = new Set(
            currentUser.sentRequests.map((r) => r.user.toString())
        );

        const receivedRequests = new Set(
            currentUser.friendRequests.map((r) => r.user.toString())
        );

        const users = await User.find({
            email: { $regex: keyword, $options: "i" },
            _id: { $ne: userId },
        }).select("_id name email avatar");

        const result = users.map((user) => {
            const id = user._id.toString();
            return {
                _id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                isFriend: friends.has(id),
                sentRequest: sentRequests.has(id),
                receivedRequest: receivedRequests.has(id),
            };
        });

        res.json(result);
    } catch (err) {
        console.error("Lỗi khi tìm kiếm người dùng:", err);
        res.status(500).json({ error: "Lỗi server khi tìm kiếm người dùng" });
    }
};

export const searchFriends = async (req, res) => {
    try {
        const keyword = req.query.q?.trim() || "";
        const userId = req.userId;

        const user = await User.findById(userId)
            .populate("friends.user", "_id name email avatar")
            .select("friends");

        if (!user) {
            return res.status(404).json({ error: "Không tìm thấy user" });
        }

        const result = user.friends.filter(
            (f) =>
                f.user.name.toLowerCase().includes(keyword.toLowerCase()) ||
                f.user.email.toLowerCase().includes(keyword.toLowerCase())
        );

        res.json(result);
    } catch (err) {
        console.error("Lỗi khi tìm kiếm bạn bè:", err);
        res.status(500).json({ error: "Lỗi server khi tìm kiếm bạn bè" });
    }
};

export const sendFriendRequest = async (req, res) => {
    const { userId } = req;
    const { toUserId } = req.body;

    if (userId === toUserId) {
        return res
            .status(400)
            .json({ error: "Không thể gửi lời mời cho chính mình" });
    }

    const fromUser = await User.findById(userId);
    const toUser = await User.findById(toUserId);

    if (!toUser) {
        return res.status(404).json({ error: "Không tìm thấy người nhận" });
    }

    const alreadyFriends = fromUser.friends.some(
        (f) => f.user.toString() === toUserId
    );

    const alreadySent = fromUser.sentRequests.some(
        (r) => r.user.toString() === toUserId
    );

    if (alreadyFriends) {
        return res.status(400).json({ error: "Đã là bạn bè" });
    }
    if (alreadySent) {
        return res.status(400).json({ error: "Đã gửi lời mời" });
    }

    const now = new Date();
    fromUser.sentRequests.push({ user: toUserId, date: now });
    toUser.friendRequests.push({ user: userId, date: now });

    await fromUser.save();
    await toUser.save();

    res.json({ message: "Đã gửi lời mời kết bạn" });
};

export const acceptFriendRequest = async (req, res) => {
    const { userId } = req;
    const { fromUserId } = req.body;

    const user = await User.findById(userId);
    const fromUser = await User.findById(fromUserId);

    if (!fromUser) {
        return res.status(404).json({ error: "Không tìm thấy người gửi" });
    }

    // Xoá lời mời
    user.friendRequests = user.friendRequests.filter(
        (r) => r.user.toString() !== fromUserId
    );

    fromUser.sentRequests = fromUser.sentRequests.filter(
        (r) => r.user.toString() !== userId
    );

    // Thêm vào danh sách bạn
    const now = new Date();
    user.friends.push({ user: fromUserId, date: now });
    fromUser.friends.push({ user: userId, date: now });

    await user.save();
    await fromUser.save();

    res.json({ message: "Đã chấp nhận lời mời kết bạn" });
};

export const rejectFriendRequest = async (req, res) => {
    const { userId } = req;
    const { fromUserId } = req.body;

    const user = await User.findById(userId);
    const fromUser = await User.findById(fromUserId);

    if (!fromUser) {
        return res.status(404).json({ error: "Không tìm thấy người gửi" });
    }

    user.friendRequests = user.friendRequests.filter(
        (r) => r.user.toString() !== fromUserId
    );
    fromUser.sentRequests = fromUser.sentRequests.filter(
        (r) => r.user.toString() !== userId
    );

    await user.save();
    await fromUser.save();

    res.json({ message: "Đã từ chối lời mời kết bạn" });
};
