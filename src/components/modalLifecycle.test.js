import assert from "node:assert/strict";
import test from "node:test";
import { openModal } from "./modalLifecycle.js";

function mockStyle(initial = {}) {
    const values = new Map(Object.entries(initial).map(([name, value]) => [name, { value, priority: "" }]));
    return {
        getPropertyValue: (name) => values.get(name)?.value || "",
        getPropertyPriority: (name) => values.get(name)?.priority || "",
        setProperty: (name, value, priority = "") => values.set(name, { value, priority }),
        removeProperty: (name) => values.delete(name),
    };
}

function mockEnvironment(stableGutter = false) {
    const focusCalls = [];
    const previousFocus = { isConnected: true, focus: (options) => focusCalls.push(["previous", options]) };
    const initialFocus = { focus: (options) => focusCalls.push(["initial", options]) };
    const document = {
        activeElement: previousFocus,
        documentElement: { clientWidth: 1000, style: mockStyle({ overflow: "auto" }) },
        body: { style: mockStyle({ "padding-right": "4px" }) },
    };
    const window = {
        innerWidth: 1016,
        CSS: { supports: () => stableGutter },
        getComputedStyle: () => ({ paddingRight: "4px" }),
    };
    const dialog = {
        open: false,
        showModal() { this.open = true; },
        close() { this.open = false; },
        querySelector: () => initialFocus,
    };
    return { document, window, dialog, focusCalls, previousFocus };
}

test("opening a modal locks page scroll, compensates scrollbar width, and focuses its initial control", () => {
    const { document, window, dialog, focusCalls } = mockEnvironment();
    const restore = openModal(dialog, document, window);
    assert.equal(dialog.open, true);
    assert.equal(document.documentElement.style.getPropertyValue("overflow"), "hidden");
    assert.equal(document.body.style.getPropertyValue("overflow"), "hidden");
    assert.equal(document.body.style.getPropertyValue("padding-right"), "20px");
    assert.deepEqual(focusCalls, [["initial", { preventScroll: true }]]);
    restore();
    assert.equal(dialog.open, false);
    assert.equal(document.documentElement.style.getPropertyValue("overflow"), "auto");
    assert.equal(document.body.style.getPropertyValue("overflow"), "");
    assert.equal(document.body.style.getPropertyValue("padding-right"), "4px");
    assert.deepEqual(focusCalls.at(-1), ["previous", { preventScroll: true }]);
});

test("stable scrollbar gutters do not receive double compensation and style priorities are restored", () => {
    const { document, window, dialog } = mockEnvironment(true);
    document.body.style.setProperty("overflow", "scroll", "important");
    const restore = openModal(dialog, document, window);
    assert.equal(document.body.style.getPropertyValue("padding-right"), "4px");
    restore();
    assert.equal(document.body.style.getPropertyValue("overflow"), "scroll");
    assert.equal(document.body.style.getPropertyPriority("overflow"), "important");
});

test("cleanup tolerates removed triggers and repeated mount-cleanup cycles", () => {
    const environment = mockEnvironment();
    const restore = openModal(environment.dialog, environment.document, environment.window);
    environment.previousFocus.isConnected = false;
    restore();
    assert.equal(environment.focusCalls.length, 1);
    environment.previousFocus.isConnected = true;
    openModal(environment.dialog, environment.document, environment.window)();
    assert.equal(environment.document.body.style.getPropertyValue("padding-right"), "4px");
});

test("a failed native dialog opening restores page styles and previous focus", () => {
    const { document, window, dialog, focusCalls } = mockEnvironment();
    dialog.showModal = () => { throw new Error("Cannot open dialog"); };
    assert.throws(() => openModal(dialog, document, window), /Cannot open dialog/);
    assert.equal(document.body.style.getPropertyValue("overflow"), "");
    assert.equal(document.body.style.getPropertyValue("padding-right"), "4px");
    assert.deepEqual(focusCalls, [["previous", { preventScroll: true }]]);
});

test("success can restore the original registration control even when focus was elsewhere on opening", () => {
    const { document, window, dialog, focusCalls } = mockEnvironment();
    const registrationButton = {
        isConnected: true,
        disabled: false,
        focus: (options) => focusCalls.push(["registration", options]),
    };
    openModal(dialog, document, window, registrationButton)();
    assert.deepEqual(focusCalls.at(-1), ["registration", { preventScroll: true }]);
    registrationButton.disabled = true;
    const restore = openModal(dialog, document, window, registrationButton);
    const callCount = focusCalls.length;
    restore();
    assert.equal(focusCalls.length, callCount);
});