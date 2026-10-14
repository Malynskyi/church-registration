import assert from "node:assert/strict";
import test from "node:test";
import { checkLoginAttempt } from "./loginBehavior.js";

test("matching password invokes mocked session and redirect effects", () => {
    const effects = [];
    const accepted = checkLoginAttempt(
        "mock-valid-password",
        "mock-valid-password",
        () => effects.push("session", "redirect:/admin"),
        () => effects.push("error"),
    );

    assert.equal(accepted, true);
    assert.deepEqual(effects, ["session", "redirect:/admin"]);
});

test("nonmatching password invokes only the mocked error effect", () => {
    const effects = [];
    const accepted = checkLoginAttempt(
        "mock-invalid-password",
        "mock-valid-password",
        () => effects.push("session", "redirect:/admin"),
        () => effects.push("error"),
    );

    assert.equal(accepted, false);
    assert.deepEqual(effects, ["error"]);
});