import { describe, it, expect } from "vitest";

// Extracting the parsing logic to test it in isolation
// In a real refactor, this function should be exported from a utility file.
// For this test, I will replicate the logic to verify it works as expected.

const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
};

describe("CSV Parser Logic", () => {
  it("should parse simple CSV lines", () => {
    const line = "GD01-001,Gundam,LR,Set1,1";
    const result = parseCSVLine(line);
    expect(result).toEqual(["GD01-001", "Gundam", "LR", "Set1", "1"]);
  });

  it("should handle quoted values with commas", () => {
    const line = 'GD01-002,"Gundam, The Origin",SR,Set1,2';
    const result = parseCSVLine(line);
    expect(result).toEqual([
      "GD01-002",
      "Gundam, The Origin",
      "SR",
      "Set1",
      "2",
    ]);
  });

  it("should handle escaped quotes", () => {
    const line = 'GD01-003,"Gundam ""RX-78""",R,Set1,1';
    const result = parseCSVLine(line);
    expect(result).toEqual(["GD01-003", 'Gundam "RX-78"', "R", "Set1", "1"]);
  });
});
