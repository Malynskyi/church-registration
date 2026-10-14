export const conferenceEvent = Object.freeze({
    localStart: "2026-10-17T11:00:00",
    timeZone: "Europe/Berlin",
    location: "Fulda, Zieherser Weg 14",
    endTime: null,
    publiclyEnabled: true,
});

export function getEventStartInstant(localStart, timeZone) {
    const match = typeof localStart === "string"
        ? localStart.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})$/)
        : null;
    if (!match || !timeZone) return null;

    const [, year, month, day, hour, minute, second] = match.map(Number);
    const desiredTimestamp = Date.UTC(year, month - 1, day, hour, minute, second);
    const checkDate = new Date(desiredTimestamp);
    if (
        checkDate.getUTCFullYear() !== year || checkDate.getUTCMonth() !== month - 1 ||
        checkDate.getUTCDate() !== day || checkDate.getUTCHours() !== hour ||
        checkDate.getUTCMinutes() !== minute || checkDate.getUTCSeconds() !== second
    ) return null;

    let formatter;
    try {
        formatter = new Intl.DateTimeFormat("en-US", {
            timeZone,
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hourCycle: "h23",
        });
    } catch {
        return null;
    }

    let timestamp = desiredTimestamp;
    for (let attempt = 0; attempt < 6; attempt += 1) {
        const formatted = Object.fromEntries(
            formatter.formatToParts(new Date(timestamp))
                .filter(({ type }) => type !== "literal")
                .map(({ type, value }) => [type, Number(value)])
        );
        const observedTimestamp = Date.UTC(
            formatted.year,
            formatted.month - 1,
            formatted.day,
            formatted.hour,
            formatted.minute,
            formatted.second,
        );
        const adjustment = desiredTimestamp - observedTimestamp;
        if (adjustment === 0) return new Date(timestamp);
        timestamp += adjustment;
    }
    return null;
}

export function getCountdownParts(startTimestamp, nowTimestamp) {
    const totalSeconds = Math.floor(Math.max(0, startTimestamp - nowTimestamp) / 1000);
    return {
        started: nowTimestamp >= startTimestamp,
        days: Math.floor(totalSeconds / 86400),
        hours: Math.floor((totalSeconds % 86400) / 3600),
        minutes: Math.floor((totalSeconds % 3600) / 60),
        seconds: totalSeconds % 60,
    };
}

export function getCountdownRingProgress({ hours, minutes, seconds }) {
    const secondsInDay = Math.max(0, Math.min(86400, hours * 3600 + minutes * 60 + seconds));
    const secondsInHour = Math.max(0, Math.min(3600, minutes * 60 + seconds));
    return {
        hours: secondsInDay / 86400 * 100,
        minutes: secondsInHour / 3600 * 100,
    };
}

export function startCountdownClock(onTick, timerHost, visibilityHost) {
    const interval = timerHost.setInterval(() => onTick(false), 1000);
    const handleVisibilityChange = () => {
        if (visibilityHost.visibilityState === "visible") onTick(true);
    };

    visibilityHost.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
        timerHost.clearInterval(interval);
        visibilityHost.removeEventListener("visibilitychange", handleVisibilityChange);
    };
}

function escapeIcs(value) {
    return String(value)
        .replace(/\\/g, "\\\\")
        .replace(/\r?\n/g, "\\n")
        .replace(/,/g, "\\,")
        .replace(/;/g, "\\;");
}

function formatIcsTimestamp(date) {
    return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

export function createConferenceCalendar(event, title, now = new Date()) {
    const start = getEventStartInstant(event.localStart, event.timeZone);
    if (!start) return null;

    const lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Church Family Registration//Conference//EN",
        "CALSCALE:GREGORIAN",
        "BEGIN:VEVENT",
        "UID:church-family-conference-2026@registration.invalid",
        `DTSTAMP:${formatIcsTimestamp(now)}`,
        `DTSTART:${formatIcsTimestamp(start)}`,
        `SUMMARY:${escapeIcs(title)}`,
        `LOCATION:${escapeIcs(event.location)}`,
        "END:VEVENT",
        "END:VCALENDAR",
    ];
    return `${lines.join("\r\n")}\r\n`;
}