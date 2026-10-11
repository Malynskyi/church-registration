import { useState } from "react";

import conferencePoster from "../assets/conference-poster.jpg";

import { Link } from "react-router-dom";

import "../styles/RegistrationPage.css";
import { api } from "../services/api";

import FatherForm from "../components/FatherForm";
import MotherForm from "../components/MotherForm";
import ChildrenForm from "../components/ChildrenForm";

import { initialFamily } from "../data/initialFamily";

export default function RegistrationPage() {
    const [family, setFamily] = useState(initialFamily);

    const handleSubmit = async () => {
        if (
            !family.father.firstName ||
            !family.father.lastName ||
            !family.mother.firstName ||
            !family.mother.lastName
        ) {
            alert("Заполните все обязательные поля");
            return;
        }

        if (family.children.some((child) => child === "")) {
            alert("Укажите возраст всех детей");
            return;
        }

        try {
            const response = await api.post(
                "/api/families",
                family
            );

            alert(response.data.message);

            setFamily({
                father: {
                    firstName: "",
                    lastName: "",
                    phone: "",
                },
                mother: {
                    firstName: "",
                    lastName: "",
                },
                children: [""],
            });
            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });

        } catch (error) {
            console.error(error);

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

            <textarea
                className="form-input"
                placeholder="💬 Комментарий (необязательно)"
                rows="4"
                value={family.comment || ""}
                onChange={(e) =>
                    setFamily((prev) => ({
                        ...prev,
                        comment: e.target.value,
                    }))
                }
            />

            <button
                className="submit-button"
                onClick={handleSubmit}
            >
                Зарегистрировать семью
            </button>

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