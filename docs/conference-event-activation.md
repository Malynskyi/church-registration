# Conference Countdown Activation

The existing registration page and poster confirm the local start as **17 October 2026 at 11:00** and the venue as **Fulda, Zieherser Weg 14**. The source material does not confirm an IANA timezone or an end time.

The frontend configuration in `src/data/conferenceEvent.js` therefore keeps the timezone unset and `publiclyEnabled` false. The countdown and calendar action return no UI until an organizer confirms the timezone and enables the feature. Do not infer the timezone from the venue address without confirmation.

The calendar generator uses a UTC `DTSTART` after timezone conversion and deliberately omits `DTEND` and `DURATION` while no end time is confirmed. It requests no account access and makes no external calendar calls.

Before enabling, confirm:

- The intended IANA timezone for the 11:00 start.
- That the displayed title and venue address are correct.
- Whether an end time should be included. If not, the calendar entry remains start-only.

After approval, set the confirmed timezone and `publiclyEnabled: true` in the frontend configuration, then verify the countdown and generated `.ics` file in a Vercel Preview deployment. No production data or backend setting is involved.