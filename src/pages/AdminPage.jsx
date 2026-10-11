import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { api } from "../services/api";

export default function AdminPage() {
    const [families, setFamilies] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const isAdmin =
        localStorage.getItem("isAdmin") === "true";
    const totalFamilies = families.length;
    const totalAdults = families.reduce(
        (total, family) =>
            total + (Number(family.adults) || 1),
        0
    );
    const totalChildren = families.reduce(
        (total, family) =>
            total +
            (Array.isArray(family.children)
                ? family.children.length
                : 0),
        0
    );
    const totalPeople = totalAdults + totalChildren;
    const loadFamilies = async () => {
        try {
            setError("");
            const response = await api.get("/api/families");
            setFamilies(
                Array.isArray(response.data)
                    ? response.data
                    : []
            );
        } catch (err) {
            console.error("Ошибка загрузки семей:", err);
            setError(
                "Не удалось загрузить семьи. Попробуйте обновить страницу."
            );
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        if (isAdmin) {
            loadFamilies();
        } else {
            setLoading(false);
        }
    }, [isAdmin]);
    const deleteFamily = async (id) => {
        const confirmed = window.confirm(
            "Вы уверены, что хотите удалить семью?"
        );
        if (!confirmed) {
            return;
        }
        try {
            await api.delete(`/api/families/${id}`);
            await loadFamilies();
        } catch (err) {
            console.error("Ошибка удаления семьи:", err);
            setError(
                "Не удалось удалить семью. Попробуйте ещё раз."
            );
        }
    };
    if (!isAdmin) {
        return (
            <Navigate
                to="/family-admin-2026"
                replace
            />
        );
    }
    const filteredFamilies = families.filter((family) =>
        JSON.stringify(family)
            .toLowerCase()
            .includes(search.toLowerCase())
    );
    return (
        <div className="registration-container">
            <h1 className="registration-title">
                Зарегистрированные семьи
            </h1>
            <button
                className="submit-button"
                onClick={() => {
                    localStorage.removeItem("isAdmin");
                    window.location.href = "/";
                }}
            >
                Выйти
            </button>
            <div
                style={{
                    border: "1px solid #ddd",
                    borderRadius: "10px",
                    padding: "15px",
                    marginBottom: "20px",
                    backgroundColor: "#f8f9fa",
                }}
            >
                <h3>📊 Статистика</h3>
                <p>Семей: {totalFamilies}</p>
                <p>Взрослых: {totalAdults}</p>
                <p>Детей: {totalChildren}</p>
                <p>Всего людей: {totalPeople}</p>
                <input
                    className="form-input"
                    placeholder="Поиск по фамилии"
                    value={search}
                    onChange={(e) =>
                        setSearch(e.target.value)
                    }
                />
            </div>
            <Link to="/">
                ← Вернуться к регистрации
            </Link>
            <br />
            <br />
            {loading && <p>Загрузка семей...</p>}
            {!loading && error && (
                <p role="alert">{error}</p>
            )}
            {!loading &&
                !error &&
                filteredFamilies.length === 0 && (
                    <p>
                        {search
                            ? "По вашему запросу ничего не найдено."
                            : "Пока нет зарегистрированных семей."}
                    </p>
                )}
            {!loading &&
                filteredFamilies.map((family) => {
                    const adults =
                        Number(family.adults) || 1;
                    const children = Array.isArray(
                        family.children
                    )
                        ? family.children
                        : [];
                    return (
                        <div
                            key={family.id}
                            style={{
                                border: "1px solid #ddd",
                                borderRadius: "10px",
                                padding: "20px",
                                marginBottom: "20px",
                            }}
                        >
                            <p>
                                👨 Взрослые: {adults}
                            </p>
                            <p>
                                👶 Детей: {children.length}
                            </p>
                            <p>
                                ✅ Всего участников:{" "}
                                {adults + children.length}
                            </p>
                            <p>
                                📅 Дата регистрации:{" "}
                                {family.created_at
                                    ? new Date(
                                        family.created_at
                                    ).toLocaleString()
                                    : "-"}
                            </p>
                            <p>Возраст детей:</p>
                            {children.length > 0 ? (
                                <ul>
                                    {children.map(
                                        (age, index) => (
                                            <li key={index}>
                                                {age} лет
                                            </li>
                                        )
                                    )}
                                </ul>
                            ) : (
                                <p>Детей нет</p>
                            )}
                            <button
                                className="submit-button"
                                onClick={() =>
                                    deleteFamily(family.id)
                                }
                            >
                                Удалить семью
                            </button>
                        </div>
                    );
                })}
        </div>
    );

}