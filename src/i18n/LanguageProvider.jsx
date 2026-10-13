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