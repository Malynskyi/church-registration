export default function MotherForm({ mother, setFamily }) {
    return (
        <>
            <h2 className="section-title">Мать</h2>

            <input
                className="form-input"
                placeholder="Имя"
                value={mother.firstName}
                onChange={(e) =>
                    setFamily((prev) => ({
                        ...prev,
                        mother: {
                            ...prev.mother,
                            firstName: e.target.value,
                        },
                    }))
                }
            />

            <input
                className="form-input"
                placeholder="Фамилия"
                value={mother.lastName}
                onChange={(e) =>
                    setFamily((prev) => ({
                        ...prev,
                        mother: {
                            ...prev.mother,
                            lastName: e.target.value,
                        },
                    }))
                }
            />

        </>
    );
}