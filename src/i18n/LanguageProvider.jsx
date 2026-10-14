import { useEffect, useState } from "react";
import { normalizeLanguage, translate } from "./translations";
import { LanguageContext, useLanguage } from "./LanguageContext";

const STORAGE_KEY = "church-registration-language";

export function LanguageProvider({ children }) {
    const [language, setLanguage] = useState(() => {
        try {
            return normalizeLanguage(localStorage.getItem(STORAGE_KEY));
        } catch {
            return "uk";
        }
    });

    useEffect(() => {
        document.documentElement.lang = language;
        document.title = translate(language, "title");
        try {
            localStorage.setItem(STORAGE_KEY, language);
        } catch {
        }
    }, [language]);

    const t = (key, values) => translate(language, key, values);

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function LanguageSwitcher() {
    const { language, setLanguage, t } = useLanguage();

    return (
        <div className="language-bar">
            <a className="contacts-link" href="#contacts">
                <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" focusable="false">
                    <rect x="2.5" y="4" width="15" height="12" rx="2" />
                    <path d="m3.5 5 6.5 5 6.5-5" />
                </svg>
                <span>{t("contacts")}</span>
                <svg className="contacts-chevron" viewBox="0 0 12 12" fill="none" aria-hidden="true" focusable="false">
                    <path d="m2.5 4.5 3.5 3 3.5-3" />
                </svg>
            </a>
            <div className="language-switcher" role="group" aria-label={t("language")}>
                <button type="button" lang="uk" aria-label="Українська" aria-pressed={language === "uk"} onClick={() => setLanguage("uk")}>
                    UA
                </button>
                <button type="button" lang="de" aria-label="Deutsch" aria-pressed={language === "de"} onClick={() => setLanguage("de")}>
                    DE
                </button>
                <button type="button" lang="ru" aria-label="Русский" aria-pressed={language === "ru"} onClick={() => setLanguage("ru")}>
                    RU
                </button>
            </div>
        </div>
    );
}