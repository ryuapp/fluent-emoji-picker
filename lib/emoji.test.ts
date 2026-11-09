import { describe, expect, test } from "bun:test";
import {
  emojiGroups,
  filterEmojis,
  formatEmojiSvg,
  getEmojiList,
  getEmojiUrl,
} from "./emoji.ts";

describe("emoji search", () => {
  test("includes newly synced upstream emoji", () => {
    for (const name of [
      "shaking face",
      "pink heart",
      "jellyfish",
      "person walking facing right",
    ]) {
      expect(filterEmojis(name).some((emoji) => emoji.name === name)).toBe(
        true,
      );
    }
  });
  test("includes the full gallery, including emoji past the old 99-item limit", () => {
    expect(filterEmojis("")).toHaveLength(getEmojiList().length);
    expect(
      filterEmojis("rocket").some((emoji) => emoji.name === "rocket"),
    ).toBe(true);
  });

  test("ignores case and extra spaces and matches each search word", () => {
    const results = filterEmojis("  FACE   GRINNING  ");
    expect(results.length).toBeGreaterThan(0);
    expect(
      results.every(
        (emoji) =>
          emoji.name.includes("face") && emoji.name.includes("grinning"),
      ),
    ).toBe(true);
  });

  test("combines category and name filters", () => {
    expect(emojiGroups).toContain("Animals & Nature");
    const results = filterEmojis("cat", "Animals & Nature");
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((emoji) => emoji.group === "Animals & Nature")).toBe(
      true,
    );
    expect(filterEmojis("rocket", "Animals & Nature")).toEqual([]);
    expect(filterEmojis("no-such-emoji-12345")).toEqual([]);
  });
});

describe("SVG copying", () => {
  test("uses the recorded upstream revision and exceptional SVG filename", () => {
    const emoji = getEmojiList().find(
      (entry) => entry.path === "O button blood type",
    );
    expect(emoji).toBeDefined();
    if (!emoji) {
      throw new Error("Expected blood type emoji in the catalog");
    }
    const url = getEmojiUrl(emoji);
    expect(url).toMatch(/\/fluentui-emoji\/[a-f0-9]{40}\/assets\//);
    expect(url).toContain("/Flat/o_button_(blood_type)_flat.svg");
  });
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><rect width="12" height="8" /></svg>';

  test("preserves the original SVG in default mode", () => {
    expect(formatEmojiSvg(svg, "svg")).toBe(svg);
  });

  test.each(["class", "className"] as const)(
    "sets %s only on the SVG root",
    (format) => {
      const result = formatEmojiSvg(svg, format);
      expect(result).toContain(`${format}="size-8"`);
      expect(result).toContain('viewBox="0 0 32 32"');
      expect(result).not.toContain('width="32"');
      expect(result).not.toContain('height="32"');
      expect(result).toContain('<rect width="12" height="8" />');
    },
  );

  test("replaces existing root classes rather than creating duplicate attributes", () => {
    const result = formatEmojiSvg(
      "<svg class='old' height='32' width='32'></svg>",
      "className",
    );
    expect(result).toBe('<svg className="size-8"></svg>');
  });

  test("encodes asset paths and handles skin tone and punctuation conventions", () => {
    const emoji = {
      id: 1,
      name: "test",
      group: "People & Body",
      path: "Woman’s: hand",
      skintones: true,
    };
    const url = getEmojiUrl(emoji);
    expect(url).toContain(
      "Womans%20hand/Default/Flat/womans_hand_flat_default.svg",
    );
    expect(getEmojiUrl(getEmojiList()[0])).toContain(
      "Grinning%20face/Flat/grinning_face_flat.svg",
    );
  });
});
