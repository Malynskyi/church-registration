import { useRef, useState } from "react";

import conferencePoster from "../assets/conference-poster.jpg";

import "../styles/RegistrationPage.css";
import { api } from "../services/api";

import ChildrenForm from "../components/ChildrenForm";
import ConferenceCountdown from "../components/ConferenceCountdown";
import Modal from "../components/Modal";
import SiteFooter from "../components/SiteFooter";

import { initialFamily } from "../data/initialFamily";
import { useLanguage } from "../i18n/LanguageContext";
import { serverMessageKeys } from "../i18n/translations";

export default function RegistrationPage() {
    const { t } = useLanguage();
    const [family, setFamily] = useState(initialFamily);

    const [isSubmitting, setIsSubmitting] = useState(false);

    const submissionLock = useRef(false);

    const idempotencyRequest = useRef(null);
    const registrationButtonRef = useRef(null);

    const [showConfirm, setShowConfirm] = useState(false);

    const [showSuccess, setShowSuccess] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const handleSubmit = async () => {
        if (submissionLock.current) return;

        submissionLock.current = true;
        setIsSubmitting(true);

        if (family.children.some((child) => child === "")) {
            setErrorMessage(t("missingAges"));
            submissionLock.current = false;
            setIsSubmitting(false);
            return;
        }


        try {
            const familyToSend = {
                ...family,

                father: {
                    firstName: "",
                    lastName: "",
                    phone: family.phone || "",
                },

                mother: {
                    firstName: "",
                    lastName: "",
                    phone: "",
                },
            };

            const fingerprint = JSON.stringify(familyToSend);
            if (idempotencyRequest.current?.fingerprint !== fingerprint) {
                idempotencyRequest.current = {
                    fingerprint,
                    key: globalThis.crypto?.randomUUID?.() ||
                        `${Date.now()}-${Math.random().toString(36).slice(2)}`,
                };
            }

            await api.post("/api/families", familyToSend, {
                headers: {
                    "Idempotency-Key": idempotencyRequest.current.key,
                },
            });

            idempotencyRequest.current = null;
            setShowSuccess(true);

            setFamily({
                adults: 1,
                children: [],
                phone: "",
                wantsContact: false,
            });
            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });

        } catch (error) {
            const responseMessage = error.response?.data?.message;
            const requestId = error.response?.data?.requestId;
            const errorMessage = typeof responseMessage === "string"
                ? t(serverMessageKeys[responseMessage] || "saveError")
                : error.response
                    ? t("httpError", { status: error.response.status })
                    : t("networkError");

            setErrorMessage(requestId ? `${errorMessage}\n${t("errorCode")}: ${requestId}` : errorMessage);
        } finally {
            submissionLock.current = false;
            setIsSubmitting(false);
        }
    };

    return (
        <>
        <main className="registration-container">
            <header className="registration-header">
            <p className="conference-eyebrow">{t("conference")}</p>
            <h1 className="registration-title">
                {t("title")}
            </h1>

            <p className="conference-verse">
                {t("verse")}
            </p>

            <div className="conference-info" id="conference-info">
                <div id="conference-location">
                    <span className="event-label">{t("date")}</span>
                    <time dateTime="2026-10-17T11:00">17.10.2026 · 11:00</time>
                </div>
                <div>
                    <span className="event-label">{t("location")}</span>
                    <a
                        href="https://www.google.com/maps/search/?api=1&query=Zieherser+Weg+14%2C+Fulda%2C+Germany"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="address-link"
                    >
                        Fulda, Zieherser Weg 14
                    </a>
                </div>
            </div>
            <a href="#poster" className="poster-link">{t("details")} ↓</a>
            </header>

            <ConferenceCountdown />

            <section className="registration-section adults-section" aria-labelledby="participants-title">
            <h2 id="participants-title" className="section-title">
                {t("participants")}
            </h2>

            <div className="participants-counter">
                <button
                    type="button"
                    aria-label={t("decreaseAdults")}
                    title={t("decreaseAdults")}
                    onClick={() =>
                        setFamily((prev) => ({
                            ...prev,
                            adults: Math.max(1, prev.adults - 1),
                        }))
                    }
                >
                    −
                </button>

                <span className="counter-value">
                    <small>{t("adults")}</small>
                    <strong>{family.adults}</strong>
                </span>

                <button
                    type="button"
                    aria-label={t("increaseAdults")}
                    title={t("increaseAdults")}
                    onClick={() =>
                        setFamily((prev) => ({
                            ...prev,
                            adults: prev.adults + 1,
                        }))
                    }
                >
                    +
                </button>
            </div>
            </section>

            <ChildrenForm
                children={family.children}
                setFamily={setFamily}
            />

            <div className="total-participants" aria-live="polite">
                <span>{t("total")}</span>
                <strong>{family.adults + family.children.length}</strong>
            </div>



            {showConfirm && (
                <Modal titleId="confirmation-title" title={t("confirmTitle")} returnFocusRef={registrationButtonRef}>
                    <dl className="modal-summary">
                        <div><dt>{t("adults")}</dt><dd>{family.adults}</dd></div>
                        <div><dt>{t("childrenCount")}</dt><dd>{family.children.length}</dd></div>
                        <div className="modal-summary-total"><dt>{t("total")}</dt><dd>{family.adults + family.children.length}</dd></div>
                    </dl>

                    <div className="modal-buttons">
                        <button
                            type="button"
                            className="cancel-button"
                            data-modal-initial-focus
                            onClick={() => setShowConfirm(false)}
                        >
                            {t("cancel")}
                        </button>

                        <button
                            type="button"
                            className="confirm-button"
                            disabled={isSubmitting}
                            onClick={() => {
                                setShowConfirm(false);
                                handleSubmit();
                            }}
                        >
                            {isSubmitting ? t("sending") : t("confirm")}
                        </button>
                    </div>
                </Modal>
            )}


            <button
                className="submit-button"
                ref={registrationButtonRef}
                disabled={isSubmitting}
                onClick={() => setShowConfirm(true)}
            >
                {isSubmitting ? t("sending") : t("register")}
            </button>


            {showSuccess && (
                <Modal titleId="success-title" descriptionId="success-message" title={t("thanks")} success returnFocusRef={registrationButtonRef}>
                        <p id="success-message" className="modal-message">
                            {t("success")}
                        </p>

                        <button
                            type="button"
                            className="confirm-button"
                            data-modal-initial-focus
                            onClick={() => setShowSuccess(false)}
                        >
                            {t("done")}
                        </button>
                </Modal>
            )}

            {errorMessage && (
                <Modal
                    titleId="registration-error-title"
                    descriptionId="registration-error-message"
                    title={t("errorTitle")}
                    error
                    returnFocusRef={registrationButtonRef}
                >
                    <p id="registration-error-message" className="modal-message">
                        {errorMessage}
                    </p>
                    <div className="modal-buttons">
                        <button
                            type="button"
                            className="confirm-button"
                            data-modal-initial-focus
                            onClick={() => setErrorMessage("")}
                        >
                            {t("done")}
                        </button>
                    </div>
                </Modal>
            )}

            <h2
                id="poster"
                className="poster-title">
                {t("details")}
            </h2>

            <img
                src={conferencePoster}
                alt={t("posterAlt")}
                className="conference-poster"
            />

        </main>
        <SiteFooter />
        </>
    );
}