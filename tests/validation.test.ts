import { describe, expect, it } from "vitest";

import { registrationSchema } from "@/utils/validation";

describe("registrationSchema", () => {
  it("trims and accepts Thai names", () => {
    const result = registrationSchema.parse({
      firstName: "  สมชาย ",
      lastName: " ใจดี  ",
      clientRequestId: "4f531a37-a0ce-4c6c-aab0-04973b7e3b60",
    });

    expect(result.firstName).toBe("สมชาย");
    expect(result.lastName).toBe("ใจดี");
  });

  it("rejects html injection", () => {
    expect(() =>
      registrationSchema.parse({
        firstName: "<script>alert(1)</script>",
        lastName: "Safe",
        clientRequestId: "4f531a37-a0ce-4c6c-aab0-04973b7e3b60",
      }),
    ).toThrow();
  });

  it("rejects sql-like input", () => {
    expect(() =>
      registrationSchema.parse({
        firstName: "Robert'); DROP TABLE Students;--",
        lastName: "Safe",
        clientRequestId: "4f531a37-a0ce-4c6c-aab0-04973b7e3b60",
      }),
    ).toThrow();
  });
});
