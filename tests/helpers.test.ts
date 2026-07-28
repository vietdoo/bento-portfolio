import { describe, expect, it } from "vitest";
import { formatDate, formatTimeTo12H, trimText } from "../src/lib/helpers";

describe("Helper Functions", () => {
  describe("trimText", () => {
    it("should return the original string if length is less than or equal to maxLength", () => {
      const text = "Hello world";
      expect(trimText(text, 20)).toBe("Hello world");
    });

    it("should trim text to exact maxLength including ellipsis when exceeding maxLength", () => {
      const text = "This is a long sentence that needs trimming";
      const trimmed = trimText(text, 15);
      expect(trimmed).toBe("This is a lo...");
      expect(trimmed.length).toBe(15);
    });

    it("should use default maxLength of 100", () => {
      const shortText = "Short text";
      expect(trimText(shortText)).toBe("Short text");

      const longText = "a".repeat(110);
      expect(trimText(longText).length).toBe(100);
      expect(trimText(longText).endsWith("...")).toBe(true);
    });
  });

  describe("formatDate", () => {
    it("should format Date object into a readable month day, year string", () => {
      const date = new Date(2026, 0, 15); // Jan 15, 2026
      expect(formatDate(date)).toBe("January 15, 2026");
    });
  });

  describe("formatTimeTo12H", () => {
    it("should format time into 12-hour format with AM/PM for specified timezone", () => {
      const date = new Date(Date.UTC(2026, 0, 1, 14, 30));
      const formatted = formatTimeTo12H(date, "UTC");
      expect(formatted).toMatch(/2:30\s?PM/i);
    });
  });
});
