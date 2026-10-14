import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { api } from "../services/api";
import { useLanguage } from "../i18n/LanguageContext";
import { languageLocales } from "../i18n/translations";
import {
    CHILD_AGE_GROUPS,
    createFamiliesCsv,
    filterFamilies,
    getRegistrationMetrics,
    hasValidDate,
    parseAdultCount,
    parseChildAge,
    sortFamilies,
} from "./adminData";

function MetricIcon({ kind }) {
    const paths = {
        families: <><path d="m3 10 9-7 9 7" /><path d="M5 9v11h14V9M9 20v-6h6v6" /></>,
        adults: <><circle cx="12" cy="8" r="4" /><path d="M5 21v-2a7 7 0 0 1 14 0v2" /></>,
        children: <><circle cx="9" cy="8" r="3" /><circle cx="17" cy="9" r="2.5" /><path d="M3 20v-2a6 6 0 0 1 12 0v2m1-5a5 5 0 0 1 5 5" /></>,
        total: <><path d="M4 7h16M4 12h16M4 17h16" /><path d="M8 4v16m8-16v16" /></>,
    };
    return (
        <svg className="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            {paths[kind]}
        </svg>
    );
}

export default function AdminPage() {
    const { t, language } = useLanguage();
    const [families, setFamilies] = useState([]);
    const [search, setSearch] = useState("");
    const [ageGroup, setAgeGroup] = useState("");
    const [sortBy, setSortBy] = useState("default");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const isAdmin =
        localStorage.getItem("isAdmin") === "true";
    const metrics = getRegistrationMetrics(families);
    const hasRegistrationDates = families.some((family) => hasValidDate(family?.created_at));
    const loadFamilies = async () => {
        try {
            setError("");
            const response = await api.get("/api/families");
            if (!Array.isArray(response.data)) {
                setFamilies([]);
                setError("invalidFamilyResponse");
                return;
            }
            setFamilies(response.data);
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
    const visibleFamilies = sortFamilies(
        filterFamilies(families, search, ageGroup),
        sortBy,
    );
    const exportFamilies = () => {
        const csv = createFamiliesCsv(visibleFamilies, {
            id: t("registrationId"),
            adults: t("adults"),
            children: t("childrenCount"),
            total: t("total"),
            ages: t("ages"),
            registeredAt: t("registeredAt"),
            notSpecified: t("notSpecified"),
            participantsUnknown: t("participantsUnknown"),
        });
        const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
        const link = document.createElement("a");
        link.href = url;
        link.download = `church-family-registrations-${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const statistics = [
        { key: "families", value: metrics.totalFamilies, icon: "families" },
        { key: "knownAdultsPartial", value: metrics.knownAdultTotal, icon: "adults" },
        { key: "familiesWithUnknownAdults", value: metrics.unknownAdultFamilyCount, icon: "adults" },
        { key: "childrenCount", value: metrics.totalChildren, icon: "children" },
        { key: "total", value: metrics.totalParticipants, icon: "total" },
    ];

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
                    {statistics.map(({ key, value, icon }) => (
                        <article className="statistics-card" key={key}>
                            <MetricIcon kind={icon} />
                            <span>{t(key)}</span>
                            <strong>{loading || error
                                ? t("metricUnavailable")
                                : key === "total" && value === null
                                    ? t("participantsUnknown")
                                    : value ?? t("metricUnavailable")}</strong>
                        </article>
                    ))}
                </div>
                {!loading && !error && metrics.invalidFamilyCount > 0 && (
                    <p className="data-quality-warning" role="status">
                        {t("dataQualityWarning", {
                            families: metrics.invalidFamilyCount,
                            ages: metrics.unclassifiedAgeCount,
                        })}
                    </p>
                )}
            </section>
            {loading && <p role="status">{t("loading")}</p>}
            {!loading && error && (
                <p role="alert">{t(error)}</p>
            )}
            {!loading && !error && (
                <section className="age-distribution" aria-labelledby="age-distribution-title">
                    <div className="dashboard-section-heading">
                        <h2 id="age-distribution-title" className="dashboard-section-title">{t("ageDistribution")}</h2>
                        <span>{metrics.totalChildren ?? t("metricUnavailable")} {t("childrenCount").toLocaleLowerCase(languageLocales[language])}</span>
                    </div>
                    <ul className="age-chart">
                        {metrics.ageDistribution.map(({ key, count }) => (
                            <li className="age-chart-row" key={key}>
                                <span className="age-chart-label">{t(key)}</span>
                                <span className="age-chart-track" aria-hidden="true">
                                    <span style={{ width: `${metrics.totalChildren ? Math.min(100, count / metrics.totalChildren * 100) : 0}%` }} />
                                </span>
                                <strong>{count}</strong>
                            </li>
                        ))}
                    </ul>
                    {metrics.unclassifiedAgeCount > 0 && (
                        <p className="chart-note">{t("unclassifiedAges", { count: metrics.unclassifiedAgeCount })}</p>
                    )}
                </section>
            )}
            {!loading && !error && (
                <section className="registration-list-section" aria-label={t("adminTitle")}>
                    <div className="dashboard-section-heading registration-list-heading">
                        <h2 className="dashboard-section-title">{t("registrations")}</h2>
                        <button className="export-button" type="button" disabled={visibleFamilies.length === 0} onClick={exportFamilies}>
                            <span aria-hidden="true">↓</span>{t("exportCsv")}
                        </button>
                    </div>
                    <div className="admin-filters">
                        <div>
                            <label className="search-label" htmlFor="family-search">{t("search")}</label>
                            <input
                                id="family-search"
                                className="form-input"
                                placeholder={t("search")}
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                            />
                        </div>
                        <div>
                            <label className="search-label" htmlFor="age-filter">{t("filterAgeGroup")}</label>
                            <select id="age-filter" className="form-input" value={ageGroup} onChange={(event) => setAgeGroup(event.target.value)}>
                                <option value="">{t("allAgeGroups")}</option>
                                {CHILD_AGE_GROUPS.map(({ key }) => <option key={key} value={key}>{t(key)}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="search-label" htmlFor="sort-families">{t("sortBy")}</label>
                            <select id="sort-families" className="form-input" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                                <option value="default">{t("sortDefault")}</option>
                                <option value="adultsDesc">{t("sortAdultsDesc")}</option>
                                <option value="adultsAsc">{t("sortAdultsAsc")}</option>
                                <option value="childrenDesc">{t("sortChildrenDesc")}</option>
                                <option value="childrenAsc">{t("sortChildrenAsc")}</option>
                                {hasRegistrationDates && <>
                                    <option value="newest">{t("sortNewest")}</option>
                                    <option value="oldest">{t("sortOldest")}</option>
                                </>}
                            </select>
                        </div>
                    </div>
                    {visibleFamilies.length === 0 && (
                        <p className="empty-state">{search || ageGroup ? t("noResults") : t("noFamilies")}</p>
                    )}
                    {visibleFamilies.length > 0 && (
                        <table className="families-table" aria-labelledby="admin-title">
                    <thead role="rowgroup">
                        <tr role="row">
                            <th scope="col">{t("registrationId")}</th>
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
                    visibleFamilies.map((family, index) => {
                    const adults = parseAdultCount(family?.adults);
                    const children = Array.isArray(
                        family?.children
                    )
                        ? family.children
                        : [];
                    return (
                        <tr
                            key={family?.id ?? `row-${index}`}
                            role="row"
                        >
                            <td role="cell" className="detail-cell">
                                <span className="mobile-cell-label" aria-hidden="true">{t("registrationId")}</span>
                                {family?.id ?? t("metricUnavailable")}
                            </td>
                            <td role="cell" className="numeric-cell">
                                <span className="mobile-cell-label" aria-hidden="true">{t("adults")}</span>
                                <strong>{adults ?? t("notSpecified")}</strong>
                            </td>
                            <td role="cell" className="numeric-cell">
                                <span className="mobile-cell-label" aria-hidden="true">{t("childrenCount")}</span>
                                <strong>{Array.isArray(family?.children) ? children.length : t("metricUnavailable")}</strong>
                            </td>
                            <td role="cell" className="numeric-cell total-cell">
                                <span className="mobile-cell-label" aria-hidden="true">{t("total")}</span>
                                <strong>{adults === null || !Array.isArray(family?.children)
                                    ? t("participantsUnknown")
                                    : adults + children.length}</strong>
                            </td>
                            <td role="cell" className="detail-cell">
                                <span className="mobile-cell-label" aria-hidden="true">{t("registeredAt")}</span>
                                {hasValidDate(family?.created_at)
                                    ? new Date(
                                        family.created_at
                                    ).toLocaleString(languageLocales[language])
                                    : t("metricUnavailable")}
                                    </td>
                                    <td role="cell" className="detail-cell">
                                    <span className="mobile-cell-label" aria-hidden="true">{t("ages")}</span>
                            {Array.isArray(family?.children) && children.length > 0 ? (
                                <ul>
                                    {children.map(
                                        (age, index) => (
                                            <li key={index}>
                                                {parseChildAge(age) === null
                                                    ? t("metricUnavailable")
                                                    : t("years", { age: parseChildAge(age) })}
                                            </li>
                                        )
                                    )}
                                </ul>
                            ) : Array.isArray(family?.children) ? (
                                <span>{t("noChildren")}</span>
                            ) : (
                                <span>{t("metricUnavailable")}</span>
                            )}
                            </td>
                            <td role="cell" className="action-cell">
                            <button
                                className="submit-button delete-button"
                                disabled={family?.id === null || family?.id === undefined}
                                onClick={() =>
                                    deleteFamily(family?.id)
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
                </section>
            )}
        </main>
    );

}