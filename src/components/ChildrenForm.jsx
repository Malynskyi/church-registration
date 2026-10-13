import { useLanguage } from "../i18n/LanguageContext";

export default function ChildrenForm({
    children,
    setFamily,
}) {
    const { t } = useLanguage();
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
        <section className="registration-section children-section" aria-labelledby="children-title">
            <h2 id="children-title" className="section-title">{t("children")}</h2>

            <div className="info-box">
                {t("childCare")}
                <br />
                {t("childInstructions")}
            </div>

            <div className="participants-counter">
                <button
                    type="button"
                    aria-label={t("decreaseChildren")}
                    title={t("decreaseChildren")}
                    onClick={() =>
                        changeChildrenCount(children.length - 1)
                    }
                >
                    −
                </button>

                <span className="counter-value">
                    <small>{t("childrenCount")}</small>
                    <strong>{children.length}</strong>
                </span>

                <button
                    type="button"
                    aria-label={t("increaseChildren")}
                    title={t("increaseChildren")}
                    onClick={() =>
                        changeChildrenCount(children.length + 1)
                    }
                >
                    +
                </button>
            </div>

            <div className="child-ages-grid">
            {children.length > 0 &&
                children.map((child, index) => (
                    <div className="child-age-field" key={index}>
                    <label htmlFor={`child-age-${index}`}>{t("childAge", { number: index + 1 })}</label>
                    <input
                        id={`child-age-${index}`}
                        className="form-input"
                        type="number"
                        min="0"
                        max="18"
                        required
                        placeholder={t("childAge", { number: index + 1 })}
                        aria-label={t("childAge", { number: index + 1 })}
                        value={child}
                        onChange={(e) =>
                            updateChild(index, e.target.value)
                        }
                    />
                    </div>
                ))}
                </div>
            </section>
    );
}
