import { conferenceEvent } from "../data/conferenceEvent";
import { useLanguage } from "../i18n/LanguageContext";
import { languageLocales } from "../i18n/translations";

export default function SiteFooter() {
    const { t, language } = useLanguage();
    const [eventDate, eventTime] = conferenceEvent.localStart.split("T");
    const formattedDate = new Intl.DateTimeFormat(languageLocales[language], {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "UTC",
    }).format(new Date(`${eventDate}T00:00:00Z`));
    const year = eventDate.slice(0, 4);

    return (
        <footer className="site-footer">
            <div className="site-footer-content">
                <section className="footer-event" aria-labelledby="footer-event-title">
                    <h2 id="footer-event-title">{t("footerEventTitle", { year })}</h2>
                    <p className="footer-welcome">{t("footerWelcome")}</p>
                    <p className="footer-event-detail">{formattedDate} · {eventTime.slice(0, 5)}</p>
                    <p className="footer-event-detail">{conferenceEvent.location}</p>
                </section>

                <nav className="footer-navigation" aria-label={t("footerNavigation")}>
                    <h2>{t("footerNavigation")}</h2>
                    <a href="#poster">{t("footerConferenceInfo")}</a>
                    <a href="#participants-title">{t("footerRegistration")}</a>
                    <a href="#conference-location">{t("footerLocation")}</a>
                </nav>

                <section className="footer-support" id="contacts" aria-labelledby="footer-support-title">
                    <h2 id="footer-support-title">{t("footerSupport")}</h2>
                    <p>{t("footerSupportMessage")}</p>
                    <a className="footer-email" href="mailto:dadima887@gmail.com">
                        dadima887@gmail.com
                    </a>
                </section>
            </div>

            <div className="site-footer-bottom">
                <span>© {year} {t("footerCopyright")}</span>
                <span className="footer-credit">Developed by Dmytro Malynskyi</span>
                <a className="footer-back-to-top" href="#root">
                    {t("backToTop")}
                    <span aria-hidden="true">↑</span>
                </a>
            </div>
        </footer>
    );
}