import assert from "node:assert/strict";
import test from "node:test";
import { languageLocales, normalizeLanguage, serverMessageKeys, translate, translations } from "./translations.js";

test("all three languages cover the same nonempty translation keys and placeholders", () => {
    assert.deepEqual(Object.keys(translations).sort(), ["de", "ru", "uk"]);
    for (const language of Object.keys(translations)) {
        assert.deepEqual(Object.keys(translations.uk).sort(), Object.keys(translations[language]).sort());
        for (const key of Object.keys(translations.uk)) {
            assert.ok(translations[language][key].trim(), `${language}: ${key}`);
            assert.deepEqual(
                translations.uk[key].match(/\{\w+\}/g),
                translations[language][key].match(/\{\w+\}/g),
                `${language}: ${key}`,
            );
        }
    }
});

test("translation interpolates counts and HTTP status without changing values", () => {
    assert.equal(translate("de", "childAge", { number: 2 }), "Alter von Kind 2");
    assert.equal(translate("uk", "years", { age: "0" }), "0 р.");
    assert.equal(translate("ru", "childAge", { number: 2 }), "Возраст ребёнка 2");
    assert.equal(translate("ru", "years", { age: "0" }), "0 г.");
    assert.match(translate("de", "httpError", { status: 500 }), /HTTP 500/);
    assert.equal(translate("unknown", "language"), translations.uk.language);
});

test("registration and login error modal titles are translated in all supported languages", () => {
    assert.deepEqual(Object.fromEntries(Object.keys(translations).map((language) => [
        language,
        [translations[language].errorTitle, translations[language].loginErrorTitle],
    ])), {
        uk: ["Перевірте введені дані", "Не вдалося увійти"],
        de: ["Bitte prüfen Sie Ihre Eingaben", "Anmeldung fehlgeschlagen"],
        ru: ["Проверьте введённые данные", "Не удалось войти"],
    });
});

test("admin login title, subtitle, and password visibility labels are localized", () => {
    assert.deepEqual(Object.fromEntries(Object.keys(translations).map((language) => [
        language,
        [
            translations[language].loginTitle,
            translations[language].loginSubtitle,
            translations[language].showPassword,
            translations[language].hidePassword,
        ],
    ])), {
        uk: ["Вхід адміністратора", "Керуйте реєстраціями та даними конференції.", "Показати пароль", "Приховати пароль"],
        de: ["Admin-Anmeldung", "Verwalten Sie Anmeldungen und Konferenzdaten.", "Passwort anzeigen", "Passwort verbergen"],
        ru: ["Вход администратора", "Управляйте регистрациями и данными конференции.", "Показать пароль", "Скрыть пароль"],
    });
});

test("footer content is translated in all supported languages", () => {
    const footerKeys = [
        "footerEventTitle", "footerWelcome", "footerNavigation", "footerConferenceInfo",
        "footerRegistration", "footerLocation", "footerSupport", "footerSupportMessage",
        "footerCopyright", "contacts", "backToTop",
    ];
    const expectedLanguages = {
        uk: ["Сімейна конференція 2026", "Тепла зустріч для всієї церковної родини.", "Навігація", "Інформація про конференцію", "Реєстрація", "Місце проведення", "Потрібна допомога?", "Напишіть нам, якщо у вас є запитання щодо реєстрації.", "Сімейна конференція", "Контакти", "На початок"],
        de: ["Familienkonferenz 2026", "Ein herzliches Treffen für die ganze Gemeindefamilie.", "Navigation", "Konferenzinformationen", "Anmeldung", "Veranstaltungsort", "Brauchen Sie Hilfe?", "Schreiben Sie uns bei Fragen zur Anmeldung.", "Familienkonferenz", "Kontakt", "Nach oben"],
        ru: ["Семейная конференция 2026", "Тёплая встреча для всей церковной семьи.", "Навигация", "Информация о конференции", "Регистрация", "Место проведения", "Нужна помощь?", "Напишите нам, если у вас есть вопросы о регистрации.", "Семейная конференция", "Контакты", "Наверх"],
    };

    for (const [language, expected] of Object.entries(expectedLanguages)) {
        assert.deepEqual(
            footerKeys.map((key) => translate(language, key, { year: "2026" })),
            expected,
        );
    }
});

test("all known registration server errors have translations in all three languages", () => {
    for (const key of Object.values(serverMessageKeys)) {
        for (const language of ["uk", "de", "ru"]) {
            assert.ok(translations[language][key], `${language}: ${key}`);
        }
    }
    assert.equal(serverMessageKeys["Не удалось сохранить регистрацию: серверная конфигурация базы данных требует проверки."], "schemaError");
});

test("stored language selection supports Russian and defaults safely to Ukrainian", () => {
    for (const language of ["uk", "de", "ru"]) {
        assert.equal(normalizeLanguage(language), language);
    }
    for (const language of [null, undefined, "", "en", "RU", "toString", "__proto__"]) {
        assert.equal(normalizeLanguage(language), "uk");
    }
    assert.deepEqual(languageLocales, { uk: "uk-UA", de: "de-DE", ru: "ru-RU" });
});