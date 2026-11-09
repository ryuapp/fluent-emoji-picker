import unavailable from "./unavailable.json";
import manifest from "./manifest.json";
import { getEmojiList } from "../emoji.ts";

const missingPreviews = new Set<number>(unavailable);
const sheets: Record<
  string,
  { src: string; width: number; height: number; columns: number }
> = manifest;
const positions = new Map<number, { group: string; index: number }>();
const counts = new Map<string, number>();
for (const emoji of getEmojiList()) {
  const index = counts.get(emoji.group) ?? 0;
  positions.set(emoji.id, { group: emoji.group, index });
  counts.set(emoji.group, index + 1);
}

export function getEmojiPreview(id: number, svgUrl: string) {
  const position = positions.get(id);
  const sheet = position ? sheets[position.group] : undefined;
  if (missingPreviews.has(id) || !position || !sheet) {
    return { src: svgUrl, left: 0, top: 0, width: 32, height: 32 };
  }
  return {
    src: sheet.src,
    left: -(position.index % sheet.columns) * 32,
    top: -Math.floor(position.index / sheet.columns) * 32,
    width: sheet.width,
    height: sheet.height,
  };
}
