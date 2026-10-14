import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext";
import { checkLoginAttempt } from "./loginBehavior.js";

export default function LoginPage() {
    const { t } = useLanguage();
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showLoginError, setShowLoginError] = useState(false);
    const navigate = useNavigate();

    const handleLogin = (event) => {
        event.preventDefault();
        setShowLoginError(false);

        checkLoginAttempt(
            password,
            "Mlnsk_4344",
            () => {
                localStorage.setItem("isAdmin", "true");
                navigate("/admin");
            },
            () => setShowLoginError(true),
        );
    };

    return (
        <main className="registration-container login-container">
            <div className="login-lock" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" focusable="false">
                    <rect x="4.75" y="10" width="14.5" height="10" rx="2.25" />
                    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                    <path d="M12 14v2" />
                </svg>
            </div>

            <header className="login-heading">
                <h1 className="registration-title">{t("loginTitle")}</h1>
                <p className="login-subtitle">{t("loginSubtitle")}</p>
            </header>

            <form className="login-form" onSubmit={handleLogin}>
                <label className="login-label" htmlFor="admin-password">{t("password")}</label>
                <div className="login-password-control">
                    <input
                        id="admin-password"
                        className="form-input login-password-input"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        aria-invalid={showLoginError}
                        aria-describedby={showLoginError ? "login-error" : undefined}
                        value={password}
                        onChange={(event) => {
                            setPassword(event.target.value);
                            setShowLoginError(false);
                        }}
                    />
                    <button
                        type="button"
                        className="login-password-toggle"
                        aria-label={t(showPassword ? "hidePassword" : "showPassword")}
                        aria-pressed={showPassword}
                        onClick={() => setShowPassword((visible) => !visible)}
                    >
                        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
                            <path d="M2.5 12s3.3-6 9.5-6 9.5 6 9.5 6-3.3 6-9.5 6-9.5-6-9.5-6Z" />
                            <circle cx="12" cy="12" r="2.75" />
                            {showPassword && <path d="m4 4 16 16" />}
                        </svg>
                    </button>
                </div>

                {showLoginError && (
                    <p id="login-error" className="login-error" role="status" aria-live="polite" aria-atomic="true">
                        <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" focusable="false">
                            <path d="M10 2.5 18 17H2L10 2.5Z" />
                            <path d="M10 7v4.5M10 14.5v.1" />
                        </svg>
                        <span>{t("wrongPassword")}</span>
                    </p>
                )}

                <button className="submit-button login-submit" type="submit">
                    {t("login")}
                </button>
            </form>
        </main>
    );
}