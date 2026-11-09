import { $ } from "bun";
import { readdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import sharp, { type OverlayOptions } from "sharp";
import emojiList from "../lib/emoji/list.json";
import { getEmojiUrl } from "../lib/emoji.ts";

// One sheet per category, displayed at 2x density for sharp previews.
const cellSize = 64;
const columns = 16;
const output = new URL("../public/emoji-previews/", import.meta.url);
await $`mkdir -p ${fileURLToPath(output)}`;
const unavailable: number[] = [];
const manifest: Record<
  string,
  { src: string; width: number; height: number; columns: number }
> = {};

for (const group of new Set(emojiList.map((emoji) => emoji.group))) {
  const batch = emojiList.filter((emoji) => emoji.group === group);
  const overlays: OverlayOptions[] = [];
  let next = 0;
  await Promise.all(
    Array.from({ length: 12 }, async () => {
      while (next < batch.length) {
        const index = next++;
        const emoji = batch[index];
        let buffer: Buffer | undefined;
        for (let attempt = 0; attempt < 3; attempt++) {
          try {
            const response = await fetch(getEmojiUrl(emoji), {
              signal: AbortSignal.timeout(15000),
            });
            if (!response.ok) {
              if (response.status === 404) {
                break;
              }
              throw new Error(`HTTP ${response.status}`);
            }
            buffer = await sharp(Buffer.from(await response.arrayBuffer()), {
              density: 144,
            })
              .resize(cellSize, cellSize)
              .png()
              .toBuffer();
            break;
          } catch (error) {
            if (attempt === 2) {
              console.warn(
                `Preview unavailable: ${emoji.name}: ${String(error)}`,
              );
            }
          }
        }
        if (!buffer) {
          unavailable.push(emoji.id);
          continue;
        }
        overlays.push({
          input: buffer,
          left: (index % columns) * cellSize,
          top: Math.floor(index / columns) * cellSize,
        });
      }
    }),
  );
  const width = columns * cellSize;
  const height = Math.ceil(batch.length / columns) * cellSize;
  const image = await sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite(overlays)
    .webp({ quality: 85, effort: 6 })
    .toBuffer();
  const hash = createHash("sha256").update(image).digest("hex").slice(0, 12);
  const filename = `${group.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.${hash}.webp`;
  await writeFile(fileURLToPath(new URL(filename, output)), image);
  manifest[group] = {
    src: `/emoji-previews/${filename}`,
    width: width / 2,
    height: height / 2,
    columns,
  };
  console.log(`${filename}: ${batch.length} emojis`);
}

await writeFile(
  new URL("../lib/emoji/manifest.json", import.meta.url),
  JSON.stringify(manifest, null, 2) + "\n",
);

await writeFile(
  new URL("../lib/emoji/unavailable.json", import.meta.url),
  JSON.stringify(unavailable, null, 2) + "\n",
);
console.log(`Done. ${unavailable.length} icons use the SVG fallback.`);
// Remove superseded generated sheets after the new manifest has been written.
const current = new Set(
  Object.values(manifest).map((sheet) => sheet.src.split("/").at(-1)),
);
const obsolete = (await readdir(output)).filter(
  (filename) =>
    /^[a-z-]+\.[a-f0-9]{12}\.webp$/.test(filename) && !current.has(filename),
);
if (obsolete.length > 0) {
  await $`rm -f ${obsolete}`.cwd(fileURLToPath(output));
}
