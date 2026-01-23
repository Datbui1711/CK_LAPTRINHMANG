import bcrypt from "bcryptjs";

import User from "../models/user.model.js";
import { generateToken } from "../../utils/jwt.js";
import cookieOptions from "../../config/cookieOptions.js";

export const getAllUsers = (req, res) => {
    res.json([
        { id: 1, name: "Alice" },
        { id: 2, name: "Bob" },
    ]);
};

export const createUser = async (req, res) => {
    try {
        const { name, email } = req.body;
        const user = await User.create({ name, email });
        res.status(201).json(user);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                error: "Vui lòng nhập đầy đủ họ tên, email và mật khẩu.",
            });
        }

        const exist = await User.findOne({ email });
        if (exist) {
            return res.status(400).json({ error: "Email đã tồn tại" });
        }

        const user = await User.create({ name, email, password });

        const token = generateToken(user._id);

        res.cookie("token", token, cookieOptions);
        res.json({ message: "Đăng ký thành công" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: "Lỗi xác thực" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: "Lỗi xác thực" });
        }

        const token = generateToken(user._id);

        res.cookie("token", token, cookieOptions);
        res.json({ message: "Đăng nhập thành công" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select("-password");
        if (!user) {
            return res.status(404).json({ error: "Không tìm thấy người dùng" });
        }

        res.json(user);
    } catch (err) {
        res.status(500).json({
            error: "Lỗi server khi lấy thông tin người dùng",
        });
    }
};

export const logout = (req, res) => {
    try {
        res.clearCookie("token", cookieOptions);
        res.status(200).json({ message: "Đăng xuất thành công" });
    } catch (err) {
        res.status(500).json({
            message: "Lỗi server khi đăng xuất",
        });
    }
};
