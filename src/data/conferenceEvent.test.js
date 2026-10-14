import assert from "node:assert/strict";
import test from "node:test";
import {
    conferenceEvent,
    createConferenceCalendar,
    getCountdownParts,
    getCountdownRingProgress,
    getEventStartInstant,
    startCountdownClock,
} from "./conferenceEvent.js";

test("configured event resolves to the confirmed UTC start instant", () => {
    assert.equal(conferenceEvent.publiclyEnabled, true);
    assert.equal(conferenceEvent.timeZone, "Europe/Berlin");
    assert.equal(
        getEventStartInstant(conferenceEvent.localStart, conferenceEvent.timeZone).toISOString(),
        "2026-10-17T09:00:00.000Z",
    );
});

test("event local time converts using the confirmed IANA timezone rules", () => {
    assert.equal(
        getEventStartInstant("2026-10-17T11:00:00", "Europe/Berlin").toISOString(),
        "2026-10-17T09:00:00.000Z",
    );
    assert.equal(
        getEventStartInstant("2026-03-29T01:30:00", "Europe/Berlin").toISOString(),
        "2026-03-29T00:30:00.000Z",
    );
    assert.equal(
        getEventStartInstant("2026-03-29T03:30:00", "Europe/Berlin").toISOString(),
        "2026-03-29T01:30:00.000Z",
    );
    assert.equal(getEventStartInstant("2026-03-29T02:30:00", "Europe/Berlin"), null);
});

test("countdown represents times before, exactly at, and after event start", () => {
    const start = Date.parse("2026-10-17T09:00:00Z");
    assert.deepEqual(getCountdownParts(start, start - 90061000), {
        started: false, days: 1, hours: 1, minutes: 1, seconds: 1,
    });
    assert.deepEqual(getCountdownParts(start, start), {
        started: true, days: 0, hours: 0, minutes: 0, seconds: 0,
    });
    assert.deepEqual(getCountdownParts(start, start + 1000), {
        started: true, days: 0, hours: 0, minutes: 0, seconds: 0,
    });
    assert.ok(Object.values(getCountdownParts(start, start + 1000)).every((value) => value >= 0));
});

test("hour and minute rings use their defined cycles without a day maximum", () => {
    assert.deepEqual(getCountdownRingProgress({ hours: 12, minutes: 30, seconds: 0 }), {
        hours: 52.083333333333336,
        minutes: 50,
    });
    const nearlyFullCycle = getCountdownRingProgress({ hours: 23, minutes: 59, seconds: 59 });
    assert.ok(nearlyFullCycle.hours > 99.9 && nearlyFullCycle.hours < 100);
    assert.ok(nearlyFullCycle.minutes > 99.9 && nearlyFullCycle.minutes < 100);
    assert.deepEqual(getCountdownRingProgress({ hours: 0, minutes: 0, seconds: 0 }), {
        hours: 0, minutes: 0,
    });
});

test("countdown clock resyncs on tab visibility and cleans up its timer and listener", () => {
    let intervalCallback;
    let intervalDelay;
    let clearedInterval;
    let visibilityCallback;
    let removedListener;
    const tickValues = [];
    const timerHost = {
        setInterval(callback, delay) {
            intervalCallback = callback;
            intervalDelay = delay;
            return 17;
        },
        clearInterval(id) {
            clearedInterval = id;
        },
    };
    const visibilityHost = {
        visibilityState: "hidden",
        addEventListener(type, callback) {
            assert.equal(type, "visibilitychange");
            visibilityCallback = callback;
        },
        removeEventListener(type, callback) {
            removedListener = { type, callback };
        },
    };

    const cleanup = startCountdownClock((forceRefresh) => tickValues.push(forceRefresh), timerHost, visibilityHost);
    assert.equal(intervalDelay, 1000);
    intervalCallback();
    assert.deepEqual(tickValues, [false]);
    visibilityCallback();
    assert.deepEqual(tickValues, [false]);
    visibilityHost.visibilityState = "visible";
    visibilityCallback();
    assert.deepEqual(tickValues, [false, true]);
    cleanup();
    assert.equal(clearedInterval, 17);
    assert.equal(removedListener.type, "visibilitychange");
    assert.equal(removedListener.callback, visibilityCallback);
});

test("calendar file has a UTC start and does not invent an end time", () => {
    const calendar = createConferenceCalendar({
        localStart: "2026-10-17T11:00:00",
        timeZone: "Europe/Berlin",
        location: "Fulda, Zieherser Weg 14",
    }, "Familienkonferenz", new Date("2026-10-14T10:00:00Z"));

    assert.match(calendar, /DTSTART:20261017T090000Z/);
    assert.doesNotMatch(calendar, /DTEND|DURATION/);
    assert.match(calendar, /LOCATION:Fulda\\, Zieherser Weg 14/);
    assert.equal(
        createConferenceCalendar({ ...conferenceEvent, timeZone: null }, "Conference"),
        null,
    );
    assert.match(createConferenceCalendar(conferenceEvent, "Conference"), /DTSTART:20261017T090000Z/);
});