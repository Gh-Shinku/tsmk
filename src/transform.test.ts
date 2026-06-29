import { describe, expect, test } from "vitest";
import { stripHeadingNumbers, shiftHeadingLevel } from "./transform";

describe("stripHeadingNumbers", () => {
  test("removes `1. ` prefix", () => {
    expect(stripHeadingNumbers("# 1. Hello")).toBe("# Hello\n");
  });

  test("removes `1.2.3 ` prefix", () => {
    expect(stripHeadingNumbers("## 1.2.3 World")).toBe("## World\n");
  });

  test("removes Chinese ordinal `一、` prefix", () => {
    expect(stripHeadingNumbers("### 一、标题")).toBe("### 标题\n");
  });

  test("removes parenthesized number `(1)` prefix", () => {
    expect(stripHeadingNumbers("## (1) 内容")).toBe("## 内容\n");
  });

  test("removes parenthesized CJK `（1）` prefix", () => {
    expect(stripHeadingNumbers("## （1）内容")).toBe("## 内容\n");
  });

  test("removes letter `A)` prefix", () => {
    expect(stripHeadingNumbers("## A) 内容")).toBe("## 内容\n");
  });

  test("removes letter `A.` prefix", () => {
    expect(stripHeadingNumbers("## A. 内容")).toBe("## 内容\n");
  });

  test("removes letter followed by CJK colon `A：` prefix", () => {
    expect(stripHeadingNumbers("## A：内容")).toBe("## 内容\n");
  });

  test("removes trailing sequence of matched prefixes", () => {
    expect(stripHeadingNumbers("# 1.2. 3. Hello")).toBe("# Hello\n");
  });

  test("does not change heading without prefix", () => {
    expect(stripHeadingNumbers("## Hello")).toBe("## Hello\n");
  });

  test("keeps non-heading text unchanged", () => {
    const input = "# 1. Hello\n\nSome 1. paragraph\n";
    expect(stripHeadingNumbers(input)).toBe("# Hello\n\nSome 1. paragraph\n");
  });

  test("handles empty string", () => {
    expect(stripHeadingNumbers("")).toBe("");
  });

  test("strips numbering from bold heading", () => {
    expect(stripHeadingNumbers("# **1. Hello**")).toBe("# **Hello**\n");
  });

  test("strips numbering only from first text child in heading", () => {
    expect(stripHeadingNumbers("# **1. Bold** normal")).toBe(
      "# **Bold** normal\n",
    );
  });

  test("removes mixed CJK and numeric prefix parts", () => {
    expect(stripHeadingNumbers("# 1.一、Hello")).toBe("# Hello\n");
  });

  test("removes `1)` prefix", () => {
    expect(stripHeadingNumbers("# 1) Hello")).toBe("# Hello\n");
  });

  test("removes `1]` prefix", () => {
    expect(stripHeadingNumbers("# 1] Hello")).toBe("# Hello\n");
  });
});

describe("shiftHeadingLevel", () => {
  test("shifts up by 1", () => {
    expect(shiftHeadingLevel("## Hello", 1)).toBe("### Hello\n");
  });

  test("shifts down by 1", () => {
    expect(shiftHeadingLevel("## Hello", -1)).toBe("# Hello\n");
  });

  test("shifts multiple headings", () => {
    const input = "# A\n\n## B\n\n### C\n";
    expect(shiftHeadingLevel(input, 1)).toBe("## A\n\n### B\n\n#### C\n");
  });

  test("clamps at level 1 (minimum)", () => {
    expect(shiftHeadingLevel("# Hello", -1)).toBe("# Hello\n");
  });

  test("clamps at level 6 (maximum)", () => {
    expect(shiftHeadingLevel("###### Hello", 1)).toBe("###### Hello\n");
  });

  test("clamps several headings at boundaries", () => {
    const input = "# A\n###### F\n";
    expect(shiftHeadingLevel(input, -2)).toBe("# A\n\n#### F\n");
    expect(shiftHeadingLevel(input, 2)).toBe("### A\n\n###### F\n");
  });

  test("offset 0 does nothing", () => {
    expect(shiftHeadingLevel("### Hello", 0)).toBe("### Hello\n");
  });

  test("handles empty string", () => {
    expect(shiftHeadingLevel("", 1)).toBe("");
  });

  test("shifts by large offset", () => {
    expect(shiftHeadingLevel("## Hello", 10)).toBe("###### Hello\n");
    expect(shiftHeadingLevel("## Hello", -10)).toBe("# Hello\n");
  });

  test("does not affect non-heading content", () => {
    const input = "## Hello\n\nparagraph\n### World\n";
    expect(shiftHeadingLevel(input, 1)).toBe(
      "### Hello\n\nparagraph\n\n#### World\n",
    );
  });
});
