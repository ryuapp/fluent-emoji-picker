import { expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { getEmojiList, emojiGroups } from "../emoji.ts";
import { getEmojiPreview } from "./preview.ts";

test("every emoji has a valid, in-bounds cell in a category atlas", () => {
  const categorySheets = new Map<string, string>();
  const cells = new Set<string>();
  for (const emoji of getEmojiList()) {
    const preview = getEmojiPreview(emoji.id, "fallback.svg");
    expect(preview.src).toMatch(/^\/emoji-previews\/[a-z-]+\.[a-f0-9]+\.webp$/);
    expect(
      existsSync(new URL(`../../public${preview.src}`, import.meta.url)),
    ).toBe(true);
    expect(-preview.left + 32).toBeLessThanOrEqual(preview.width);
    expect(-preview.top + 32).toBeLessThanOrEqual(preview.height);
    const cell = `${preview.src}:${preview.left}:${preview.top}`;
    expect(cells.has(cell)).toBe(false);
    cells.add(cell);
    const categorySheet = categorySheets.get(emoji.group);
    if (categorySheet !== undefined) {
      expect(preview.src).toBe(categorySheet);
    }
    categorySheets.set(emoji.group, preview.src);
  }
  expect(new Set(categorySheets.values()).size).toBe(emojiGroups.length);
});

test("unknown IDs use the SVG instead of a broken atlas cell", () => {
  expect(getEmojiPreview(-1, "fallback.svg")).toEqual({
    src: "fallback.svg",
    left: 0,
    top: 0,
    width: 32,
    height: 32,
  });
});
