import { useEffect, useState } from "react";
import { useLanguage } from "../i18n/LanguageContext";
import {
    conferenceEvent,
    createConferenceCalendar,
    getCountdownParts,
    getCountdownRingProgress,
    getEventStartInstant,
    startCountdownClock,
} from "../data/conferenceEvent";

export default function ConferenceCountdown() {
    const { t } = useLanguage();
    const start = getEventStartInstant(conferenceEvent.localStart, conferenceEvent.timeZone);
    const startTimestamp = start?.getTime() ?? null;
    const [now, setNow] = useState(() => Date.now());

    useEffect(() => {
        if (!conferenceEvent.publiclyEnabled || startTimestamp === null) return undefined;
        const updateClock = (forceRefresh = false) => {
            const actualNow = Date.now();
            setNow((previousNow) => {
                const previousMinute = Math.floor(Math.max(0, startTimestamp - previousNow) / 60000);
                const actualMinute = Math.floor(Math.max(0, startTimestamp - actualNow) / 60000);
                return !forceRefresh && previousMinute === actualMinute && actualNow < startTimestamp
                    ? previousNow
                    : actualNow;
            });
        };
        return startCountdownClock(updateClock, window, document);
    }, [startTimestamp]);

    if (!conferenceEvent.publiclyEnabled || !start) return null;

    const countdown = getCountdownParts(startTimestamp, now);
    const ringProgress = getCountdownRingProgress(countdown);
    const downloadCalendar = () => {
        const contents = createConferenceCalendar(conferenceEvent, t("conference"));
        if (!contents) return;
        const url = URL.createObjectURL(new Blob([contents], { type: "text/calendar;charset=utf-8" }));
        const link = document.createElement("a");
        link.href = url;
        link.download = "church-family-conference.ics";
        link.click();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    };

    return (
        <section className="conference-countdown" aria-labelledby="countdown-title">
            <div className="dashboard-section-heading">
                <h2 id="countdown-title" className="dashboard-section-title">{t("countdownTitle")}</h2>
                <button className="export-button" type="button" onClick={downloadCalendar}>
                    {t("addToCalendar")}
                </button>
            </div>
            {countdown.started ? (
                <p className="countdown-started" role="status">{t("eventStarted")}</p>
            ) : (
                <dl className="countdown-grid" aria-label={t("countdownTitle")}>
                    {[
                        ["days", countdown.days, null],
                        ["hours", countdown.hours, ringProgress.hours],
                        ["minutes", countdown.minutes, ringProgress.minutes],
                    ].map(([key, value, progress]) => (
                        <div
                            className={`countdown-unit countdown-unit-${key}`}
                            key={key}
                            style={progress === null ? undefined : { "--ring-progress": `${progress}%` }}
                        >
                            <dt>{t(key)}</dt>
                            <dd>{String(value).padStart(2, "0")}</dd>
                        </div>
                    ))}
                </dl>
            )}
        </section>
    );
}