import { formatMTTR } from "../src/lib/utils"; // I'll check where this function is

describe("formatMTTR", () => {
  test("null returns dash", () => {
    expect(formatMTTR(null)).toBe("—");
  });

  test("42 seconds returns '42s'", () => {
    expect(formatMTTR(42)).toBe("42s");
  });

  test("192 seconds returns '3m 12s'", () => {
    expect(formatMTTR(192)).toBe("3m 12s");
  });

  test("3600 seconds returns '60m 0s'", () => {
    expect(formatMTTR(3600)).toBe("60m 0s");
  });
});
