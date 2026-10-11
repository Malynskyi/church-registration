const [families, setFamilies] = useState([]);
const [search, setSearch] = useState("");
const totalFamilies = families.length;

const totalAdults = totalFamilies * 2;

const totalChildren = families.reduce(
    (total, family) => total + family.children.length,
    0
);

const totalPeople =
    totalAdults + totalChildren;

useEffect(() => {
    loadFamilies();
}, []);

const loadFamilies = async () => {
    try {
        const response = await api.get("/api/families");
        setFamilies(response.data);
    } catch (error) {
        console.error(error);
    }
};

const deleteFamily = async (id) => {
    const confirmed = window.confirm(
        "Вы уверены, что хотите удалить семью?"
    );

    if (!confirmed) {
        return;
    }

    try {
        await api.delete(`/api/families/${id}`);
        loadFamilies();
    } catch (error) {
        console.error(error);
    }
};

return (
    <div className="registration-container">
        <h1 className="registration-title">
            Зарегистрированные семьи
        </h1>

        <button
            className="submit-button"
            onClick={() => {
                localStorage.removeItem("isAdmin");
                window.location.href = "/";
            }}
        >
            Выйти
        </button>

        <div
            style={{
                border: "1px solid #ddd",
                borderRadius: "10px",
                padding: "15px",
                marginBottom: "20px",
                backgroundColor: "#f8f9fa",
            }}
        >
            <h3>📊 Статистика</h3>

            <p>Семей: {totalFamilies}</p>
            <p>Взрослых: {totalAdults}</p>
            <p>Детей: {totalChildren}</p>
            <p>Всего людей: {totalPeople}</p>

            <input
                className="form-input"
                placeholder="Поиск по фамилии"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
        </div>

        <Link to="/">← Вернуться к регистрации</Link>

        <br />
        <br />

        {families.map((family) => (
            <div
                key={family.id}
                style={{
                    border: "1px solid #ddd",
                    borderRadius: "10px",
                    padding: "20px",
                    marginBottom: "20px",
                }}
            >
                <p>
                    👨 Взрослые: {family.adults || 1}
                </p>

                <p>
                    👶 Детей: {family.children?.length || 0}
                </p>

                <p>
                    ✅ Всего участников:{" "}
                    {(family.adults || 1) +
                        (family.children?.length || 0)}
                </p>

                <p>
                    📅 Дата регистрации:{" "}
                    {new Date(
                        family.created_at
                    ).toLocaleString()}
                </p>

                <p>Возраст детей:</p>

                <ul>
                    {family.children?.map((age, index) => (
                        <li key={index}>
                            {age} лет
                        </li>
                    ))}
                </ul>

                <button
                    className="submit-button"
                    onClick={() => deleteFamily(family.id)}
                >
                    Удалить семью
                </button>
            </div>
        ))}
    </div>
);