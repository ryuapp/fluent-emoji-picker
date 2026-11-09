import emojiList from "./emoji/list.json";
import emojiSource from "./emoji/source.json";

export type Emoji = {
  id: number;
  name: string;
  group: string;
  skintones: boolean;
  path: string;
  filename?: string;
};
export type CopyFormat = "svg" | "class" | "className";

export const emojiGroups = [...new Set(emojiList.map((emoji) => emoji.group))];
const searchableEmojis = emojiList.map((emoji) => ({
  emoji,
  text: `${emoji.name} ${emoji.group}`.toLowerCase(),
}));

export function filterEmojis(query: string, group = "all") {
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length && group === "all") {
    return emojiList;
  }
  return searchableEmojis
    .filter(({ emoji, text }) => {
      return (
        (group === "all" || emoji.group === group) &&
        words.every((word) => text.includes(word))
      );
    })
    .map(({ emoji }) => emoji);
}

export function formatEmojiSvg(svg: string, format: CopyFormat) {
  if (format === "svg") {
    return svg;
  }
  return svg.replace(/<svg\b[^>]*>/i, (root) => {
    const attributes = root.replace(
      /\s(?:width|height|class|className)\s*=\s*(?:"[^"]*"|'[^']*')/g,
      "",
    );
    return attributes.replace(/<svg\b/i, `<svg ${format}="size-8"`);
  });
}

export function getEmojiList() {
  return emojiList;
}

export function getEmojiUrl(emoji: Emoji) {
  const baseUrl = `https://raw.githubusercontent.com/microsoft/fluentui-emoji/${emojiSource.revision}/assets/`;
  const folder = emoji.path.replace(/[\u2019:]/g, "");
  const filename = emoji.filename ?? folder.replace(/\s/g, "_").toLowerCase();
  const asset = emoji.skintones
    ? `${folder}/Default/Flat/${filename}_flat_default.svg`
    : `${folder}/Flat/${filename}_flat.svg`;
  return `${baseUrl.replace(/\/$/, "")}/${asset.split("/").map(encodeURIComponent).join("/")}`;
}
