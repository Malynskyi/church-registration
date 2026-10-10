import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleLogin = () => {
        if (password === "Mlnsk_4344") {
            localStorage.setItem("isAdmin", "true");
            navigate("/admin");
        } else {
            alert("Неверный пароль");
        }
    };

    return (
        <div className="registration-container">
            <h1 className="registration-title">
                Вход в админ-панель
            </h1>

            <input
                className="form-input"
                type="password"
                placeholder="Пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />

            <button
                className="submit-button"
                onClick={handleLogin}
            >
                Войти
            </button>
        </div>
    );
}