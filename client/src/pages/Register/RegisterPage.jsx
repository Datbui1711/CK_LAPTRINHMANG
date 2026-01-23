import { useState } from "react";
import {
    Eye,
    EyeOff,
    User,
    Mail,
    Lock,
    ArrowRight,
    Shield,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { register } from "../../services/userServices";
import useToastActions from "../../hooks/useToastActions";
import { getPasswordStrength } from "../../utils/helper";
import config from "../../config";

import styles from "./RegisterPage.module.css";

function RegisterPage() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const toast = useToastActions();
    const passwordStrength = getPasswordStrength(formData.password);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: "",
            }));
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = "Tên người dùng là bắt buộc";
        }

        if (!formData.email.trim()) {
            newErrors.email = "Email là bắt buộc";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Email không hợp lệ";
        }

        if (!formData.password) {
            newErrors.password = "Mật khẩu là bắt buộc";
        } else if (formData.password.length < 6) {
            newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = "Vui lòng nhập lại mật khẩu";
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Mật khẩu không khớp";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            const response = await register({
                name: formData.name,
                email: formData.email,
                password: formData.password,
            });
            toast.success(
                response.message || "Đăng ký thành công",
                "Thông báo",
                {
                    duration: 6000,
                }
            );
            navigate(config.routes.chat);
        } catch (err) {
            toast.error(err.message, "Lỗi hệ thống", {
                duration: 6000,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles["register-container"]}>
            <div className={styles["register-background"]}>
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

            <div className={styles["register-card"]}>
                <div className={styles["register-header"]}>
                    <h1 className={styles["register-title"]}>Tạo tài khoản</h1>
                    <p className={styles["register-subtitle"]}>
                        Điền thông tin để bắt đầu
                    </p>
                </div>

                <form
                    className={styles["register-form"]}
                    onSubmit={handleSubmit}
                >
                    <div className={styles["form-group"]}>
                        <label htmlFor="name" className={styles["form-label"]}>
                            Tên người dùng
                        </label>
                        <div className={styles["input-wrapper"]}>
                            <User className={styles["input-icon"]} size={20} />
                            <input
                                type="text"
                                id="name"
                                name="name"
                                className={`${styles["form-input"]} ${
                                    errors.name ? styles["error"] : ""
                                }`}
                                placeholder="Nhập tên người dùng"
                                value={formData.name}
                                onChange={handleInputChange}
                            />
                        </div>
                        {errors.name && (
                            <span className={styles["error-message"]}>
                                {errors.name}
                            </span>
                        )}
                    </div>

                    <div className={styles["form-group"]}>
                        <label htmlFor="email" className={styles["form-label"]}>
                            Email
                        </label>
                        <div className={styles["input-wrapper"]}>
                            <Mail className={styles["input-icon"]} size={20} />
                            <input
                                type="email"
                                id="email"
                                name="email"
                                className={`${styles["form-input"]} ${
                                    errors.email ? styles["error"] : ""
                                }`}
                                placeholder="Nhập địa chỉ email"
                                value={formData.email}
                                onChange={handleInputChange}
                            />
                        </div>
                        {errors.email && (
                            <span className={styles["error-message"]}>
                                {errors.email}
                            </span>
                        )}
                    </div>

                    <div className={styles["form-group"]}>
                        <label
                            htmlFor="password"
                            className={styles["form-label"]}
                        >
                            Mật khẩu
                        </label>
                        <div className={styles["input-wrapper"]}>
                            <Lock className={styles["input-icon"]} size={20} />
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                name="password"
                                className={`${styles["form-input"]} ${
                                    errors.password ? styles["error"] : ""
                                }`}
                                placeholder="Nhập mật khẩu"
                                value={formData.password}
                                onChange={handleInputChange}
                            />
                            <button
                                type="button"
                                className={styles["password-toggle"]}
                                onClick={togglePasswordVisibility}
                                aria-label={
                                    showPassword
                                        ? "Ẩn mật khẩu"
                                        : "Hiện mật khẩu"
                                }
                            >
                                {showPassword ? (
                                    <EyeOff size={20} />
                                ) : (
                                    <Eye size={20} />
                                )}
                            </button>
                        </div>
                        {formData.password && (
                            <div className={styles["password-strength"]}>
                                <div className={styles["strength-bar"]}>
                                    <div
                                        className={styles["strength-fill"]}
                                        style={{
                                            width: `${
                                                (passwordStrength.strength /
                                                    4) *
                                                100
                                            }%`,
                                            backgroundColor:
                                                passwordStrength.color,
                                        }}
                                    ></div>
                                </div>
                                <span
                                    className={styles["strength-text"]}
                                    style={{ color: passwordStrength.color }}
                                >
                                    {passwordStrength.text}
                                </span>
                            </div>
                        )}
                        {errors.password && (
                            <span className={styles["error-message"]}>
                                {errors.password}
                            </span>
                        )}
                    </div>

                    <div className={styles["form-group"]}>
                        <label
                            htmlFor="confirmPassword"
                            className={styles["form-label"]}
                        >
                            Nhập lại mật khẩu
                        </label>
                        <div className={styles["input-wrapper"]}>
                            <Shield
                                className={styles["input-icon"]}
                                size={20}
                            />
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                id="confirmPassword"
                                name="confirmPassword"
                                className={`${styles["form-input"]} ${
                                    errors.confirmPassword
                                        ? styles["error"]
                                        : ""
                                } ${
                                    formData.confirmPassword &&
                                    formData.password ===
                                        formData.confirmPassword
                                        ? styles["success"]
                                        : ""
                                }`}
                                placeholder="Nhập lại mật khẩu"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                            />
                            <button
                                type="button"
                                className={styles["password-toggle"]}
                                onClick={toggleConfirmPasswordVisibility}
                                aria-label={
                                    showConfirmPassword
                                        ? "Ẩn mật khẩu"
                                        : "Hiện mật khẩu"
                                }
                            >
                                {showConfirmPassword ? (
                                    <EyeOff size={20} />
                                ) : (
                                    <Eye size={20} />
                                )}
                            </button>
                        </div>
                        {formData.confirmPassword &&
                            formData.password === formData.confirmPassword && (
                                <span className={styles["success-message"]}>
                                    ✓ Mật khẩu khớp
                                </span>
                            )}
                        {errors.confirmPassword && (
                            <span className={styles["error-message"]}>
                                {errors.confirmPassword}
                            </span>
                        )}
                    </div>

                    <button
                        type="submit"
                        className={`${styles["submit-button"]} ${
                            isLoading ? styles["loading"] : ""
                        }`}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <div className={styles["loading-spinner"]}></div>
                        ) : (
                            <>
                                <span>Đăng ký</span>
                                <ArrowRight size={20} />
                            </>
                        )}
                    </button>
                </form>

                <div className={styles["register-footer"]}>
                    <p className={styles["login-link"]}>
                        Đã có tài khoản?{" "}
                        <Link to={config.routes.login} className={styles.link}>
                            Đăng nhập ngay
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default RegisterPage;
