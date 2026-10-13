import { useRef, useState } from "react";

import conferencePoster from "../assets/conference-poster.jpg";

import "../styles/RegistrationPage.css";
import { api } from "../services/api";

import ChildrenForm from "../components/ChildrenForm";

import { initialFamily } from "../data/initialFamily";

export default function RegistrationPage() {
    const [family, setFamily] = useState(initialFamily);

    const [isSubmitting, setIsSubmitting] = useState(false);

    const submissionLock = useRef(false);

    const idempotencyRequest = useRef(null);

    const [showConfirm, setShowConfirm] = useState(false);

    const [showSuccess, setShowSuccess] = useState(false);

    const handleSubmit = async () => {
        if (submissionLock.current) return;

        submissionLock.current = true;
        setIsSubmitting(true);

        if (family.children.some((child) => child === "")) {
            alert("Укажите возраст всех детей");
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
                ? responseMessage
                : error.response
                    ? `Не удалось сохранить регистрацию (HTTP ${error.response.status}). Попробуйте позже.`
                    : "Не удалось связаться с сервером. Проверьте подключение и попробуйте ещё раз.";

            alert(requestId ? `${errorMessage}\nКод ошибки: ${requestId}` : errorMessage);
        } finally {
            submissionLock.current = false;
            setIsSubmitting(false);
        }
    };

    return (
        <div className="registration-container">


            <h1 className="registration-title">
                Регистрация на семейную конференцию
            </h1>

            <p className="conference-verse">
                «А я и дом мой будем служить Господу»
            </p>

            <h2 className="section-title">
                Участники
            </h2>

            <div className="participants-counter">
                <button
                    type="button"
                    onClick={() =>
                        setFamily((prev) => ({
                            ...prev,
                            adults: Math.max(1, prev.adults - 1),
                        }))
                    }
                >
                    ➖
                </button>

                <span>
                    Взрослых: {family.adults}
                </span>

                <button
                    type="button"
                    onClick={() =>
                        setFamily((prev) => ({
                            ...prev,
                            adults: prev.adults + 1,
                        }))
                    }
                >
                    ➕
                </button>
            </div>

            <div className="conference-info">
                📅 17.10.2026 • 11:00
                <br />
                <a
                    href="https://www.google.com/maps/search/?api=1&query=Zieherser+Weg+14%2C+Fulda%2C+Germany"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="address-link"
                >
                    📍 Fulda, Zieherser Weg 14
                </a>
            </div>

            <a href="#poster">
                📖 Подробнее о конференции
            </a>


            <ChildrenForm
                children={family.children}
                setFamily={setFamily}
            />

            <div className="total-participants">
                ✅ Всего участников:{" "}
                {family.adults + family.children.length}
            </div>



            {showConfirm && (
                <div className="confirm-card">
                    <h3>✅ Подтвердить регистрацию</h3>

                    <p>
                        Взрослые: {family.adults}
                    </p>

                    <p>
                        Дети: {family.children.length}
                    </p>

                    <p>
                        Всего участников: {family.adults + family.children.length}
                    </p>

                    <div className="modal-buttons">
                        <button
                            className="cancel-button"
                            onClick={() => setShowConfirm(false)}
                        >
                            Отмена
                        </button>

                        <button
                            className="confirm-button"
                            disabled={isSubmitting}
                            onClick={() => {
                                setShowConfirm(false);
                                handleSubmit();
                            }}
                        >
                            {isSubmitting ? "Отправка..." : "Подтвердить"}
                        </button>
                    </div>
                </div>
            )}


            <button
                className="submit-button"
                disabled={isSubmitting}
                onClick={() => setShowConfirm(true)}
            >
                {isSubmitting ? "Отправка..." : "Зарегистрировать семью"}
            </button>


            {showSuccess && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2>✅ Спасибо!</h2>

                        <p>
                            Ваша семья успешно зарегистрирована.
                        </p>

                        <button
                            className="confirm-button"
                            onClick={() => setShowSuccess(false)}
                        >
                            Отлично
                        </button>
                    </div>
                </div>
            )}

            <h2
                id="poster"
                className="poster-title">
                Подробнее о конференции
            </h2>

            <img
                src={conferencePoster}
                alt="Постер семейной конференции"
                className="conference-poster"
            />


        </div >
    );
}