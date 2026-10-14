export const CHILD_AGE_GROUPS = [
    { key: "age0to3", min: 0, max: 3 },
    { key: "age4to6", min: 4, max: 6 },
    { key: "age7to10", min: 7, max: 10 },
    { key: "age11to14", min: 11, max: 14 },
    { key: "age15to17", min: 15, max: 17 },
    { key: "age18plus", min: 18, max: 18 },
];

function parseNonnegativeInteger(value) {
    if (typeof value === "string" && value.trim() === "") return null;
    if (typeof value !== "number" && typeof value !== "string") return null;
    const parsed = Number(value);
    return Number.isSafeInteger(parsed) && parsed >= 0 ? parsed : null;
}

export function parseAdultCount(value) {
    return parseNonnegativeInteger(value);
}

export function parseChildAge(value) {
    const age = parseNonnegativeInteger(value);
    return age !== null && age <= 18 ? age : null;
}

export function hasValidDate(value) {
    return value !== null && value !== undefined && value !== "" && Number.isFinite(Date.parse(value));
}

export function getRegistrationMetrics(families) {
    if (!Array.isArray(families)) {
        return {
            totalFamilies: null,
            totalAdults: null,
            knownAdultTotal: null,
            unknownAdultFamilyCount: null,
            totalChildren: null,
            totalParticipants: null,
            invalidFamilyCount: 0,
            unclassifiedAgeCount: 0,
            ageDistribution: CHILD_AGE_GROUPS.map((group) => ({ ...group, count: 0 })),
        };
    }

    let adultTotal = 0;
    let unknownAdultFamilyCount = 0;
    let childTotal = 0;
    let adultsComplete = true;
    let childrenComplete = true;
    let invalidFamilyCount = 0;
    let unclassifiedAgeCount = 0;
    const ageCounts = new Map(CHILD_AGE_GROUPS.map((group) => [group.key, 0]));

    for (const family of families) {
        const adults = parseNonnegativeInteger(family?.adults);
        const hasChildren = Array.isArray(family?.children);
        let familyIsInvalid = adults === null || !hasChildren;

        if (adults === null) {
            adultsComplete = false;
            unknownAdultFamilyCount += 1;
        } else {
            adultTotal += adults;
        }

        if (!hasChildren) {
            childrenComplete = false;
        } else {
            childTotal += family.children.length;
            for (const value of family.children) {
                const age = parseChildAge(value);
                const group = CHILD_AGE_GROUPS.find((candidate) =>
                    age !== null && age >= candidate.min && age <= candidate.max
                );
                if (group) ageCounts.set(group.key, ageCounts.get(group.key) + 1);
                else {
                    unclassifiedAgeCount += 1;
                    familyIsInvalid = true;
                }
            }
        }

        if (familyIsInvalid) invalidFamilyCount += 1;
    }

    const totalAdults = adultsComplete ? adultTotal : null;
    const totalChildren = childrenComplete ? childTotal : null;
    return {
        totalFamilies: families.length,
        totalAdults,
        knownAdultTotal: adultTotal,
        unknownAdultFamilyCount,
        totalChildren,
        totalParticipants: totalAdults === null || totalChildren === null
            ? null
            : totalAdults + totalChildren,
        invalidFamilyCount,
        unclassifiedAgeCount,
        ageDistribution: CHILD_AGE_GROUPS.map((group) => ({
            ...group,
            count: ageCounts.get(group.key),
        })),
    };
}

export function filterFamilies(families, search, ageGroupKey = "") {
    const query = search.trim().toLocaleLowerCase();
    const selectedGroup = CHILD_AGE_GROUPS.find((group) => group.key === ageGroupKey);

    return families.filter((family) => {
        const children = Array.isArray(family?.children) ? family.children : [];
        const safeSearchFields = [
            family?.id,
            family?.adults,
            ...children,
            family?.created_at,
        ];
        const matchesSearch = !query || safeSearchFields.some((value) =>
            String(value ?? "").toLocaleLowerCase().includes(query)
        );
        const matchesAge = !selectedGroup || children.some((value) => {
            const age = parseChildAge(value);
            return age !== null && age >= selectedGroup.min && age <= selectedGroup.max;
        });
        return matchesSearch && matchesAge;
    });
}

function numericSortValue(value) {
    return parseNonnegativeInteger(value);
}

export function sortFamilies(families, sortBy) {
    const sorted = [...families];
    const sorters = {
        adultsAsc: { value: (family) => numericSortValue(family?.adults), direction: 1 },
        adultsDesc: { value: (family) => numericSortValue(family?.adults), direction: -1 },
        childrenAsc: {
            value: (family) => Array.isArray(family?.children) ? family.children.length : null,
            direction: 1,
        },
        childrenDesc: {
            value: (family) => Array.isArray(family?.children) ? family.children.length : null,
            direction: -1,
        },
        oldest: {
            value: (family) => hasValidDate(family?.created_at) ? Date.parse(family.created_at) : null,
            direction: 1,
        },
        newest: {
            value: (family) => hasValidDate(family?.created_at) ? Date.parse(family.created_at) : null,
            direction: -1,
        },
    };
    const sorter = sorters[sortBy];
    if (!sorter) return sorted;
    return sorted.sort((left, right) => {
        const leftValue = sorter.value(left);
        const rightValue = sorter.value(right);
        if (leftValue === null) return rightValue === null ? 0 : 1;
        if (rightValue === null) return -1;
        return (leftValue - rightValue) * sorter.direction;
    });
}

function csvCell(value) {
    let text = String(value ?? "");
    if (/^\s*[=+\-@]/.test(text)) text = `'${text}`;
    return `"${text.replace(/"/g, '""')}"`;
}

export function createFamiliesCsv(families, labels) {
    const includeId = families.some((family) => family?.id !== null && family?.id !== undefined);
    const includeDate = families.some((family) => hasValidDate(family?.created_at));
    const columns = [
        ...(includeId ? [["id", labels.id]] : []),
        ["adults", labels.adults],
        ["childrenCount", labels.children],
        ["total", labels.total],
        ["ages", labels.ages],
        ...(includeDate ? [["registeredAt", labels.registeredAt]] : []),
    ];
    const rows = families.map((family) => {
        const adults = parseNonnegativeInteger(family?.adults);
        const children = Array.isArray(family?.children) ? family.children : null;
        const childAges = children?.map((age) => parseChildAge(age) ?? labels.notSpecified).join("; ") ?? labels.notSpecified;
        const values = {
            id: family?.id,
            adults: adults ?? labels.notSpecified,
            childrenCount: children?.length ?? labels.notSpecified,
            total: adults !== null && children
                ? adults + children.length
                : labels.participantsUnknown ?? labels.notSpecified,
            ages: childAges,
            registeredAt: hasValidDate(family?.created_at) ? family.created_at : "",
        };
        return columns.map(([key]) => csvCell(values[key])).join(",");
    });
    return `\uFEFF${columns.map(([, label]) => csvCell(label)).join(",")}\r\n${rows.join("\r\n")}`;
}