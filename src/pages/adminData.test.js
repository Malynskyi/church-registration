import assert from "node:assert/strict";
import test from "node:test";
import {
    createFamiliesCsv,
    filterFamilies,
    getRegistrationMetrics,
    sortFamilies,
} from "./adminData.js";

test("registration metrics count zero adults and every valid child age once", () => {
    const metrics = getRegistrationMetrics([
        { adults: 0, children: ["0", 3, 4, 6, 7, 10, 11, 14, 15, 17, 18] },
        { adults: 2, children: [] },
    ]);

    assert.equal(metrics.totalFamilies, 2);
    assert.equal(metrics.totalAdults, 2);
    assert.equal(metrics.totalChildren, 11);
    assert.equal(metrics.totalParticipants, 13);
    assert.deepEqual(metrics.ageDistribution.map(({ count }) => count), [2, 2, 2, 2, 2, 1]);
    assert.equal(metrics.ageDistribution.reduce((total, group) => total + group.count, 0), 11);
});

test("empty and malformed registration data never invents counts or ages", () => {
    assert.equal(getRegistrationMetrics([]).totalParticipants, 0);
    const metrics = getRegistrationMetrics([
        { adults: "invalid", children: ["", null, 19, "2"] },
        { adults: 1 },
    ]);

    assert.equal(metrics.totalFamilies, 2);
    assert.equal(metrics.totalAdults, null);
    assert.equal(metrics.totalChildren, null);
    assert.equal(metrics.totalParticipants, null);
    assert.equal(metrics.invalidFamilyCount, 2);
    assert.equal(metrics.unclassifiedAgeCount, 3);
    assert.equal(metrics.ageDistribution[0].count, 1);
});

test("filters only existing non-sensitive values and child age groups", () => {
    const families = [
        { id: 1, adults: 2, children: ["3"], phone: "secret", created_at: "2026-10-01" },
        { id: 2, adults: 1, children: ["7"], phone: "private", created_at: "2026-10-02" },
    ];

    assert.deepEqual(filterFamilies(families, "secret"), []);
    assert.deepEqual(filterFamilies(families, "7", "age7to10"), [families[1]]);
    assert.deepEqual(sortFamilies(families, "adultsAsc"), [families[1], families[0]]);
    assert.deepEqual(sortFamilies(families, "newest"), [families[1], families[0]]);
});

test("CSV is UTF-8-ready, quotes special fields, includes available fields, and neutralizes formulas", () => {
    const csv = createFamiliesCsv([
        {
            id: '=HYPERLINK("https://invalid")',
            adults: 2,
            children: ["7"],
            created_at: "2026-10-01T10:00:00Z",
        },
    ], {
        id: "ID", adults: "Adults", children: "Children", total: "Total",
        ages: 'Ages,\n"years"', registeredAt: "Registered at",
    });

    assert.ok(csv.startsWith("\uFEFF"));
    assert.match(csv, /"'=?HYPERLINK\(""https:\/\/invalid""\)"/);
    assert.match(csv, /"Ages,\n""years"""/);
    assert.match(csv, /"2026-10-01T10:00:00Z"/);
});