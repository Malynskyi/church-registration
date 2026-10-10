import { useState } from "react";



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



            <FatherForm
                father={family.father}
                setFamily={setFamily}
            />

            <MotherForm
                mother={family.mother}
                setFamily={setFamily}
            />

            <ChildrenForm
                children={family.children}
                setFamily={setFamily}
            />

            <button
                className="submit-button"
                onClick={handleSubmit}
            >
                Зарегистрировать семью
            </button>
        </div>
    );
}