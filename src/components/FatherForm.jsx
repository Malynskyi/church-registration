import { useLanguage } from "../i18n/LanguageContext";

export default function FatherForm({ father, setFamily }) {
    const { t } = useLanguage();
    return (
        <>
            <h2 className="section-title">{t("father")}</h2>

            <input
                className="form-input"
                placeholder={t("firstName")}
                aria-label={t("firstName")}
                value={father.firstName}
                onChange={(e) =>
                    setFamily((prev) => ({
                        ...prev,
                        father: {
                            ...prev.father,
                            firstName: e.target.value,
                        },
                    }))
                }
            />

            <input
                className="form-input"
                placeholder={t("lastName")}
                aria-label={t("lastName")}
                value={father.lastName}
                onChange={(e) =>
                    setFamily((prev) => ({
                        ...prev,
                        father: {
                            ...prev.father,
                            lastName: e.target.value,
                        },
                    }))
                }
            />

            <input
                className="form-input"
                placeholder={t("phone")}
                aria-label={t("phone")}
                value={father.phone}
                onChange={(e) =>
                    setFamily((prev) => ({
                        ...prev,
                        father: {
                            ...prev.father,
                            phone: e.target.value,
                        },
                    }))
                }
            />
        </>
    );
}