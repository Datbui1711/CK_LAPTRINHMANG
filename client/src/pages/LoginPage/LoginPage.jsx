import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Eye,
    EyeOff,
    Mail,
    Lock,
    User,
    ArrowRight,
    Loader2,
} from "lucide-react";

import { login } from "../../services/userServices";
import config from "../../config";
import useToastActions from "../../hooks/useToastActions";

import styles from "./LoginPage.module.css";

export default function LoginPage() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        email: "",
        password: "",
    });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [focusedField, setFocusedField] = useState("");

    const toast = useToastActions();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await login(form);
            toast.success(
                response.message || "Đăng nhập thành công",
                "Thông báo",
                {
                    duration: 6000,
                }
            );
            navigate(config.routes.chat);
        } catch (err) {
            toast.error(err.message, "Thông báo", {
                duration: 6000,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles["login-container"]}>
            <div className={styles["login-background"]}>
                <div
                    className={styles["bg-shape"] + " " + styles["shape-1"]}
                ></div>
                <div
                    className={styles["bg-shape"] + " " + styles["shape-2"]}
                ></div>
                <div
                    className={styles["bg-shape"] + " " + styles["shape-3"]}
                ></div>
            </div>

            <div className={styles["login-card"]}>
                <div className={styles["login-header"]}>
                    <div className={styles["login-avatar"]}>
                        <User size={32} />
                    </div>
                    <h1 className={styles["login-title"]}>Chào mừng trở lại</h1>
                    <p className={styles["login-subtitle"]}>
                        Đăng nhập để tiếp tục
                    </p>
                </div>

                <form className={styles["login-form"]} onSubmit={handleSubmit}>
                    <div
                        className={`${styles["input-wrapper"]} ${
                            focusedField === "email" ? styles["focused"] : ""
                        }`}
                    >
                        <div className={styles["input-icon"]}>
                            <Mail size={20} />
                        </div>
                        <input
                            type="email"
                            name="email"
                            placeholder="Nhập email của bạn"
                            value={form.email}
                            onChange={handleChange}
                            onFocus={() => setFocusedField("email")}
                            onBlur={() => setFocusedField("")}
                            required
                            className={styles["login-input"]}
                        />
                    </div>

                    <div
                        className={`${styles["input-wrapper"]} ${
                            focusedField === "password" ? styles["focused"] : ""
                        }`}
                    >
                        <div className={styles["input-icon"]}>
                            <Lock size={20} />
                        </div>
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder="Nhập mật khẩu"
                            value={form.password}
                            onChange={handleChange}
                            onFocus={() => setFocusedField("password")}
                            onBlur={() => setFocusedField("")}
                            required
                            className={styles["login-input"]}
                        />
                        <button
                            type="button"
                            className={styles["password-toggle"]}
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? (
                                <EyeOff size={20} />
                            ) : (
                                <Eye size={20} />
                            )}
                        </button>
                    </div>

                    <div className={styles["form-options"]}>
                        <label className={styles["remember-me"]}>
                            <input type="checkbox" />
                            <span className={styles["checkmark"]}></span>
                            Ghi nhớ đăng nhập
                        </label>
                        <a href="#" className={styles["forgot-password"]}>
                            Quên mật khẩu?
                        </a>
                    </div>

                    <button
                        type="submit"
                        className={styles["login-button"]}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2
                                    size={20}
                                    className={styles["spinner"]}
                                />
                                Đang đăng nhập...
                            </>
                        ) : (
                            <>
                                Đăng nhập
                                <ArrowRight size={20} />
                            </>
                        )}
                    </button>
                </form>

                <div className={styles["login-footer"]}>
                    <p>
                        Chưa có tài khoản?{" "}
                        <Link
                            to={config.routes.register}
                            className={styles["signup-link"]}
                        >
                            Đăng ký ngay
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
