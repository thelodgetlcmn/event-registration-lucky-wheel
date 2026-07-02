import { describe, expect, it } from "vitest";

import { csvToImportRegistrants, registrantsToCsv } from "@/utils/csv";

describe("csv utilities", () => {
  it("parses quoted csv import rows", () => {
    const rows = csvToImportRegistrants('First Name,Last Name\n"Jane, A.",Doe\nSomchai,Jaidee');

    expect(rows).toEqual([
      { firstName: "Jane, A.", lastName: "Doe" },
      { firstName: "Somchai", lastName: "Jaidee" },
    ]);
  });

  it("exports registrants with headers", () => {
    const csv = registrantsToCsv([
      {
        firstName: "Somchai",
        lastName: "Jaidee",
        status: "AVAILABLE",
        timestamp: "2026-07-02T00:00:00.000Z",
        uuid: "uuid-1",
        winner: false,
      },
    ]);

    expect(csv).toContain("Timestamp,First Name,Last Name,UUID,Status,Winner");
    expect(csv).toContain("Somchai");
  });
});
