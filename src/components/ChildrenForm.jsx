export default function ChildrenForm({
    children,
    setFamily,
}) {
    const changeChildrenCount = (newCount) => {
        if (newCount < 0) return;
        if (newCount > 15) return;

        const updatedChildren = [...children];

        while (updatedChildren.length < newCount) {
            updatedChildren.push("");
        }

        while (updatedChildren.length > newCount) {
            updatedChildren.pop();
        }

        setFamily((prev) => ({
            ...prev,
            children: updatedChildren,
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

            <div className="info-box">
                👶 Мы позаботимся о ваших детях во время конференции.
                <br />
                Пожалуйста, укажите количество и возраст детей.
            </div>

            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "20px",
                    marginBottom: "20px",
                }}
            >
                <button
                    type="button"
                    onClick={() =>
                        changeChildrenCount(children.length - 1)
                    }
                    style={{
                        padding: "8px 15px",
                        borderRadius: "10px",
                        border: "1px solid #ccc",
                        cursor: "pointer",
                    }}
                >
                    ➖
                </button>

                <strong
                    style={{
                        fontSize: "18px",
                    }}
                >
                    Детей: {children.length}
                </strong>

                <button
                    type="button"
                    onClick={() =>
                        changeChildrenCount(children.length + 1)
                    }
                    style={{
                        padding: "8px 15px",
                        borderRadius: "10px",
                        border: "1px solid #ccc",
                        cursor: "pointer",
                    }}
                >
                    ➕
                </button>
            </div>

            {children.length > 0 &&
                children.map((child, index) => (
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
        </>
    );
}
