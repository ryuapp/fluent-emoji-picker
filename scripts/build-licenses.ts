import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { build } from "vite";
import License from "unplugin-license/vite";
import packageJson from "../package.json";
import { parseLicenseNotices } from "../lib/license.ts";

const notice = new URL("../.vinext/third-party-licenses.md", import.meta.url);

// Vite dev does not run generateBundle. Prepare notices before starting it.
// Production collects licenses directly from the application's client bundle.
await build({
  configFile: false,
  root: fileURLToPath(new URL("../", import.meta.url)),
  logLevel: "error",
  plugins: [License({ output: { file: notice.href } })],
  build: {
    write: false,
    minify: false,
    rolldownOptions: {
      platform: "node",
      input: Object.keys(packageJson.dependencies).map((name) =>
        fileURLToPath(import.meta.resolve(name)),
      ),
      // Optional tooling and Next.js compatibility imports are not installed.
      external: [
        /^node:/,
        /^bun:/,
        "esbuild",
        /^@vitejs\/devtools\//,
        /^next\//,
      ],
      output: { format: "esm" },
    },
  },
});
const dependencies = parseLicenseNotices(await readFile(notice, "utf8"));
for (const name of Object.keys(packageJson.dependencies)) {
  if (!dependencies.some((entry) => entry.name === name)) {
    throw new Error(`Missing license notice for ${name}`);
  }
}
console.log(`Collected ${dependencies.length} dependency license notices.`);
