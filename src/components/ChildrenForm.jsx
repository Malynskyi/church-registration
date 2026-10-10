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
                <input
                    key={index}
                    className="form-input"
                    type="number"
                    min="0"
                    max="18"
                    placeholder={`Возраст ребенка ${index + 1}`}
                    value={child}
                    onChange={(e) =>
                        updateChild(index, e.target.value)
                    }
                />
            ))}

            <button
                type="button"
                className="submit-button"
                onClick={addChild}
            >
                ➕ Добавить ребенка
            </button>
        </>
    );
}
