import { $ } from "bun";
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import emojiList from "../lib/emoji/list.json";
import type { Emoji } from "../lib/emoji.ts";

type Tree = {
  truncated: boolean;
  tree: { path: string; type: string; sha: string }[];
};
type Metadata = { cldr: string; group: string };
const repository = "microsoft/fluentui-emoji";

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { signal: AbortSignal.timeout(30_000) });
  if (!response.ok) {
    throw new Error(`${response.status}: ${url}`);
  }
  return response.json() as Promise<T>;
}

const { sha: revision } = await fetchJson<{ sha: string }>(
  `https://api.github.com/repos/${repository}/commits/main`,
);
const root = await fetchJson<Tree>(
  `https://api.github.com/repos/${repository}/git/trees/${revision}`,
);
const assets = root.tree.find((entry) => entry.path === "assets");
if (!assets) {
  throw new Error("Upstream assets directory not found");
}
const tree = await fetchJson<Tree>(
  `https://api.github.com/repos/${repository}/git/trees/${assets.sha}`,
);
if (tree.truncated) {
  throw new Error("Upstream asset tree is incomplete");
}
const directories = tree.tree.filter((entry) => entry.type === "tree");
const folders = directories.map((entry) => entry.path);
const cache = new URL(
  `../.vinext/emoji-metadata/${revision}/`,
  import.meta.url,
);
await $`mkdir -p ${fileURLToPath(cache)}`;
const previous = new Map<string, Emoji>(
  emojiList.map((emoji) => [emoji.path.replace(/[\u2019:]/g, ""), emoji]),
);
const groups = [...new Set(emojiList.map((emoji) => emoji.group))];
let nextId = Math.max(...emojiList.map((emoji) => emoji.id)) + 1;
// Allocate IDs before concurrent requests so runs are deterministic.
const ids = new Map(
  folders.map((folder) => [folder, previous.get(folder)?.id ?? nextId++]),
);
const updated = new Array<Emoji>(folders.length);
let next = 0;
let completed = 0;

await Promise.all(
  Array.from({ length: 16 }, async () => {
    while (next < folders.length) {
      const index = next++;
      const folder = folders[index];
      const base = `https://raw.githubusercontent.com/${repository}/${revision}/assets/${encodeURIComponent(folder)}`;
      let metadata: Metadata | undefined;
      const cachedMetadata = new URL(
        `${encodeURIComponent(folder)}.json`,
        cache,
      );
      try {
        metadata = JSON.parse(
          await readFile(cachedMetadata, "utf8"),
        ) as Metadata;
      } catch {
        /* Download uncached metadata below. */
      }
      for (let attempt = 0; attempt < 3; attempt++) {
        if (metadata) {
          break;
        }
        try {
          metadata = await fetchJson<Metadata>(`${base}/metadata.json`);
          await writeFile(cachedMetadata, JSON.stringify(metadata));
          break;
        } catch (error) {
          if (attempt === 2) {
            throw error;
          }
        }
      }
      if (!metadata?.cldr || !metadata.group) {
        throw new Error(`Incomplete metadata: ${folder}`);
      }
      let skintones = previous.get(folder)?.skintones;
      let filenameOverride = previous.get(folder)?.filename;
      if (skintones === undefined) {
        const filename = folder.replace(/\s/g, "_").toLowerCase();
        const flat = await fetch(`${base}/Flat/${filename}_flat.svg`, {
          method: "HEAD",
        });
        if (flat.ok) {
          skintones = false;
        } else if (flat.status === 404) {
          const toned = await fetch(
            `${base}/Default/Flat/${filename}_flat_default.svg`,
            { method: "HEAD" },
          );
          if (toned.ok) {
            skintones = true;
          } else if (toned.status === 404) {
            const files = await fetchJson<Tree>(
              `https://api.github.com/repos/${repository}/git/trees/${directories[index].sha}?recursive=1`,
            );
            if (files.truncated) {
              throw new Error(`Incomplete asset tree: ${folder}`);
            }
            const svg = files.tree.find((file) =>
              /^(?:Default\/)?Flat\/.+\.svg$/.test(file.path),
            );
            if (!svg) {
              throw new Error(`Flat SVG unavailable: ${folder}`);
            }
            skintones = svg.path.startsWith("Default/");
            filenameOverride = svg.path
              .slice(svg.path.lastIndexOf("/") + 1)
              .replace(/_flat(?:_default)?\.svg$/, "");
          } else {
            throw new Error(`SVG check failed: ${folder} (${toned.status})`);
          }
        } else {
          throw new Error(`SVG check failed: ${folder} (${flat.status})`);
        }
      }
      const id = ids.get(folder);
      if (id === undefined) {
        throw new Error(`Emoji ID was not allocated: ${folder}`);
      }
      updated[index] = {
        id,
        name: metadata.cldr,
        group: metadata.group,
        skintones,
        path: folder,
        ...(filenameOverride ? { filename: filenameOverride } : {}),
      };
      completed++;
      if (completed % 200 === 0) {
        console.log(`Metadata: ${completed}/${folders.length}`);
      }
    }
  }),
);

updated.sort((a, b) => {
  const groupA = groups.indexOf(a.group);
  const groupB = groups.indexOf(b.group);
  return (
    (groupA < 0 ? groups.length : groupA) -
      (groupB < 0 ? groups.length : groupB) || a.id - b.id
  );
});
await writeFile(
  new URL("../lib/emoji/list.json", import.meta.url),
  JSON.stringify(updated),
);
await writeFile(
  new URL("../lib/emoji/source.json", import.meta.url),
  JSON.stringify({ repository, revision }, null, 2) + "\n",
);
console.log(
  `Updated ${emojiList.length} → ${updated.length} emojis from ${revision}`,
);
