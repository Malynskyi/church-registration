import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext";

export default function LoginPage() {
    const { t } = useLanguage();
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleLogin = () => {
        if (password === "Mlnsk_4344") {
            localStorage.setItem("isAdmin", "true");
            navigate("/admin");
        } else {
            alert(t("wrongPassword"));
        }
    };

    return (
        <main className="registration-container login-container">
            <h1 className="registration-title">
                {t("loginTitle")}
            </h1>

            <label className="login-label" htmlFor="admin-password">{t("password")}</label>
            <input
                id="admin-password"
                className="form-input"
                type="password"
                placeholder={t("password")}
                aria-label={t("password")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />

            <button
                className="submit-button"
                onClick={handleLogin}
            >
                {t("login")}
            </button>
        </main>
    );
}