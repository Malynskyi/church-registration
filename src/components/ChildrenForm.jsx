export default function ChildrenForm({
    children,
    setFamily,
}) {
    const addChild = () => {
        if (children.length >= 15) {
            alert("Максимум 15 детей");
            return;
        }

        setFamily((prev) => ({
            ...prev,
            children: [...prev.children, ""],
        }));
    };

    const updateChild = (index, value) => {
        const updatedChildren = [...children];
        updatedChildren[index] = value;

        setFamily((prev) => ({
            ...prev,
            children: updatedChildren,
        }));
    };

    const removeChild = (index) => {
        const updatedChildren = children.filter(
            (_, i) => i !== index
        );

        setFamily((prev) => ({
            ...prev,
            children: updatedChildren,
        }));
    };

    return (
        <>
            <h2 className="section-title">Дети</h2>

            <p
                style={{
                    color: "#666",
                    marginBottom: "15px",
                    fontStyle: "italic",
                }}
            >
                Мы позаботимся о ваших детях. Пожалуйста,
                укажите количество и возраст детей.
            </p>

            {children.map((child, index) => (
                <div
                    key={index}
                    style={{
                        display: "flex",
                        gap: "10px",
                        alignItems: "center",
                        marginBottom: "10px",
                    }}
                >
                    <input
                        className="form-input"
                        type="number"
                        min="0"
                        max="18"
                        placeholder={`Возраст ребенка ${index + 1}`}
                        value={child}
                        onChange={(e) =>
                            updateChild(index, e.target.value)
                        }
                        style={{ marginBottom: 0 }}
                    />

                    {children.length > 1 && (
                        <button
                            type="button"
                            onClick={() => removeChild(index)}
                            style={{
                                background: "#ef4444",
                                color: "white",
                                border: "none",
                                borderRadius: "8px",
                                padding: "10px",
                                cursor: "pointer",
                            }}
                        >
                            ❌
                        </button>
                    )}
                </div>
            ))}

            <button
                type="button"
                onClick={addChild}
                style={{
                    background: "#f3f4f6",
                    color: "#333",
                    border: "1px solid #ccc",
                    marginTop: "15px",
                    marginBottom: "25px",
                    width: "100%",
                    padding: "14px",
                    borderRadius: "12px",
                    cursor: "pointer",
                }}
            >
                ➕ Добавить ребенка
            </button>
        </>
    );
}
