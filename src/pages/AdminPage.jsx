import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { api } from "../services/api";
import { useLanguage } from "../i18n/LanguageContext";
import { languageLocales } from "../i18n/translations";

export default function AdminPage() {
    const { t, language } = useLanguage();
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
                "loadError"
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
            t("deleteConfirm")
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
                "deleteError"
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
        <main className="registration-container admin-container">
            <header className="dashboard-header">
            <p className="conference-eyebrow">{t("conference")}</p>
            <h1 id="admin-title" className="registration-title">
                {t("adminTitle")}
            </h1>
            </header>
            <div className="admin-actions">
            <Link to="/">← {t("back")}</Link>
            <button
                className="cancel-button"
                onClick={() => {
                    localStorage.removeItem("isAdmin");
                    window.location.href = "/";
                }}
            >
                {t("logout")}
            </button>
            </div>
            <section className="statistics-section" aria-labelledby="statistics-title">
                <h2 id="statistics-title" className="dashboard-section-title">{t("statistics")}</h2>
                <div className="statistics-grid">
                <p>{t("families")}<strong>{totalFamilies}</strong></p>
                <p>{t("adults")}<strong>{totalAdults}</strong></p>
                <p>{t("childrenCount")}<strong>{totalChildren}</strong></p>
                <p>{t("total")}<strong>{totalPeople}</strong></p>
                </div>
                <label className="search-label" htmlFor="family-search">{t("search")}</label>
                <input
                    id="family-search"
                    className="form-input"
                    placeholder={t("search")}
                    aria-label={t("search")}
                    value={search}
                    onChange={(e) =>
                        setSearch(e.target.value)
                    }
                />
            </section>
            {loading && <p role="status">{t("loading")}</p>}
            {!loading && error && (
                <p role="alert">{t(error)}</p>
            )}
            {!loading &&
                !error &&
                filteredFamilies.length === 0 && (
                    <p>
                        {search
                            ? t("noResults")
                            : t("noFamilies")}
                    </p>
                )}
            {!loading && filteredFamilies.length > 0 && (
                <table className="families-table" role="table" aria-labelledby="admin-title">
                    <thead role="rowgroup">
                        <tr role="row">
                            <th scope="col" role="columnheader">{t("adults")}</th>
                            <th scope="col" role="columnheader">{t("childrenCount")}</th>
                            <th scope="col" role="columnheader">{t("total")}</th>
                            <th scope="col" role="columnheader">{t("registeredAt")}</th>
                            <th scope="col" role="columnheader">{t("ages")}</th>
                            <th scope="col" role="columnheader">{t("actions")}</th>
                        </tr>
                    </thead>
                    <tbody role="rowgroup">
                    {
                filteredFamilies.map((family) => {
                    const adults =
                        Number(family.adults) || 1;
                    const children = Array.isArray(
                        family.children
                    )
                        ? family.children
                        : [];
                    return (
                        <tr
                            key={family.id}
                            role="row"
                        >
                            <td role="cell" className="numeric-cell">
                                <span className="mobile-cell-label" aria-hidden="true">{t("adults")}</span>
                                <strong>{adults}</strong>
                            </td>
                            <td role="cell" className="numeric-cell">
                                <span className="mobile-cell-label" aria-hidden="true">{t("childrenCount")}</span>
                                <strong>{children.length}</strong>
                            </td>
                            <td role="cell" className="numeric-cell total-cell">
                                <span className="mobile-cell-label" aria-hidden="true">{t("total")}</span>
                                <strong>{adults + children.length}</strong>
                            </td>
                            <td role="cell" className="detail-cell">
                                <span className="mobile-cell-label" aria-hidden="true">{t("registeredAt")}</span>
                                {family.created_at
                                    ? new Date(
                                        family.created_at
                                    ).toLocaleString(languageLocales[language])
                                    : "-"}
                                    </td>
                                    <td role="cell" className="detail-cell">
                                    <span className="mobile-cell-label" aria-hidden="true">{t("ages")}</span>
                            {children.length > 0 ? (
                                <ul>
                                    {children.map(
                                        (age, index) => (
                                            <li key={index}>
                                                {t("years", { age })}
                                            </li>
                                        )
                                    )}
                                </ul>
                            ) : (
                                <span>{t("noChildren")}</span>
                            )}
                            </td>
                            <td role="cell" className="action-cell">
                            <button
                                className="submit-button delete-button"
                                onClick={() =>
                                    deleteFamily(family.id)
                                }
                            >
                                {t("deleteFamily")}
                            </button>
                            </td>
                        </tr>
                    );
                })}
                    </tbody>
                </table>
            )}
        </main>
    );

}