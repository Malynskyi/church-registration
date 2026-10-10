export default function FatherForm({ father, setFamily }) {
    return (
        <>
            <h2 className="section-title">Отец</h2>

            <input
                className="form-input"
                placeholder="Имя"
                value={father.firstName}
                onChange={(e) =>
                    setFamily((prev) => ({
                        ...prev,
                        father: {
                            ...prev.father,
                            firstName: e.target.value,
                        },
                    }))
                }
            />

            <input
                className="form-input"
                placeholder="Фамилия"
                value={father.lastName}
                onChange={(e) =>
                    setFamily((prev) => ({
                        ...prev,
                        father: {
                            ...prev.father,
                            lastName: e.target.value,
                        },
                    }))
                }
            />

            <input
                className="form-input"
                placeholder="Телефон (необязательно)"
                value={father.phone}
                onChange={(e) =>
                    setFamily((prev) => ({
                        ...prev,
                        father: {
                            ...prev.father,
                            phone: e.target.value,
                        },
                    }))
                }
            />
        </>
    );
}