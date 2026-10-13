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