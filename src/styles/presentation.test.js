import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const theme = readFileSync(new URL("../index.css", import.meta.url), "utf8");

function themeColor(name) {
    const match = theme.match(new RegExp(`--${name}:\\s*(#[0-9a-f]{6})`, "i"));
    assert.ok(match, `Missing theme color: ${name}`);
    return match[1];
}

function luminance(hex) {
    const channels = hex.slice(1).match(/.{2}/g).map((channel) => {
        const value = Number.parseInt(channel, 16) / 255;
        return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    });
    return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

function contrast(foreground, background) {
    const foregroundLuminance = luminance(themeColor(foreground));
    const backgroundLuminance = luminance(themeColor(background));
    return (Math.max(foregroundLuminance, backgroundLuminance) + 0.05)
        / (Math.min(foregroundLuminance, backgroundLuminance) + 0.05);
}

test("Midnight Premium text colors meet WCAG AA on all opaque dark surfaces", () => {
    for (const background of ["background", "secondary", "surface"]) {
        for (const foreground of ["ink", "muted", "accent", "danger"]) {
            assert.ok(contrast(foreground, background) >= 4.5, `${foreground} on ${background}`);
        }
    }
});

test("primary button labels and focus accents have accessible contrast", () => {
    for (const background of ["accent", "accent-hover"]) {
        assert.ok(contrast("on-accent", background) >= 4.5, background);
    }
    assert.ok(contrast("accent", "surface") >= 3);
});