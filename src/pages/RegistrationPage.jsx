import { useState } from "react";

import conferencePoster from "../assets/conference-poster.jpg";

import { Link } from "react-router-dom";

import "../styles/RegistrationPage.css";
import { api } from "../services/api";

import ChildrenForm from "../components/ChildrenForm";

import { initialFamily } from "../data/initialFamily";

export default function RegistrationPage() {
    const [family, setFamily] = useState(initialFamily);

    const [isSubmitting, setIsSubmitting] = useState(false);

    const [showConfirm, setShowConfirm] = useState(false);

    const handleSubmit = async () => {
        if (isSubmitting) return;


        setIsSubmitting(true);

        if (family.children.some((child) => child === "")) {
            alert("Укажите возраст всех детей");
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

            const response = await api.post(
                "/api/families",
                familyToSend
            );

            alert(response.data.message);
            setIsSubmitting(false);

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
            setIsSubmitting(false);
            alert("Ошибка при отправке данных");
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
                📍 Fulda, Zieherweg 14
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

            <label className="contact-option">
                <input
                    type="checkbox"
                    checked={family.wantsContact}
                    onChange={(e) =>
                        setFamily((prev) => ({
                            ...prev,
                            wantsContact: e.target.checked,
                        }))
                    }
                />

                <span>📞 Оставить номер телефона</span>
            </label>

            {family.wantsContact && (
                <input
                    className="form-input"
                    type="tel"
                    placeholder="Номер телефона"
                    value={family.phone}
                    onChange={(e) =>
                        setFamily((prev) => ({
                            ...prev,
                            phone: e.target.value,
                        }))
                    }
                />
            )}

            <input
                className="form-input"
                type="tel"
                placeholder="📱 Контактный телефон (необязательно)"
                value={family.phone || ""}
                onChange={(e) =>
                    setFamily((prev) => ({
                        ...prev,
                        phone: e.target.value,
                    }))
                }
            />


            <button
                className="submit-button"
                onClick={() => setShowConfirm(true)}
            >
                Зарегистрировать семью
            </button>
            {showConfirm && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2>✅ Подтвердить регистрацию</h2>

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
                                Назад
                            </button>

                            <button
                                className="confirm-button"
                                onClick={() => {
                                    setShowConfirm(false);
                                    handleSubmit();
                                }}
                            >
                                Подтвердить
                            </button>
                        </div>
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