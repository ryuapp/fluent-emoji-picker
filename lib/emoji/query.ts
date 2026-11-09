import {
  parseAsBoolean,
  parseAsString,
  parseAsStringLiteral,
} from "nuqs/server";
import { emojiGroups } from "../emoji.ts";

export const emojiCategories = emojiGroups.map((label) => ({
  label,
  value: label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-$/, ""),
}));

export const emojiQueryParsers = {
  q: parseAsString.withDefault(""),
  category: parseAsStringLiteral([
    "all",
    ...emojiCategories.map(({ value }) => value),
  ]).withDefault("all"),
  names: parseAsBoolean.withDefault(false),
  format: parseAsStringLiteral(["svg", "class", "className"]).withDefault(
    "svg",
  ),
};
