import { useLanguage } from "../i18n/LanguageContext";

export default function MotherForm({ mother, setFamily }) {
    const { t } = useLanguage();
    return (
        <>
            <h2 className="section-title">{t("mother")}</h2>

            <input
                className="form-input"
                placeholder={t("firstName")}
                aria-label={t("firstName")}
                value={mother.firstName}
                onChange={(e) =>
                    setFamily((prev) => ({
                        ...prev,
                        mother: {
                            ...prev.mother,
                            firstName: e.target.value,
                        },
                    }))
                }
            />

            <input
                className="form-input"
                placeholder={t("lastName")}
                aria-label={t("lastName")}
                value={mother.lastName}
                onChange={(e) =>
                    setFamily((prev) => ({
                        ...prev,
                        mother: {
                            ...prev.mother,
                            lastName: e.target.value,
                        },
                    }))
                }
            />

        </>
    );
}