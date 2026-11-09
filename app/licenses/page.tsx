import { readFile } from "node:fs/promises";
import type { Metadata } from "next";
import Link from "next/link";
import { parseLicenseNotices, type LicenseNotice } from "#lib/license.ts";

export const metadata: Metadata = {
  title: "Licenses",
  description:
    "Open source licenses for Fluent Emoji Picker and its dependencies.",
};

export default async function LicensePage() {
  // Read only while rendering on the server; static export includes all notices.
  const [application, notice, generated] = await Promise.all([
    readFile("LICENSE.md", "utf8"),
    readFile("NOTICE.md", "utf8"),
    readFile(".vinext/third-party-licenses.md", "utf8"),
  ]);
  const emoji = /```text\n([\s\S]*?)\n```/.exec(notice)?.[1];
  if (!emoji) {
    throw new Error("Fluent Emoji license text is missing from NOTICE.md");
  }
  const dependencies = parseLicenseNotices(generated);
  const notices: LicenseNotice[] = [
    {
      name: "Fluent Emoji Picker",
      version: "",
      license: "MIT-0",
      text: application,
    },
    {
      name: "Fluent Emoji",
      version: "",
      license: "MIT",
      repository: "https://github.com/microsoft/fluentui-emoji",
      text: emoji,
    },
    ...dependencies,
  ];

  return (
    <section className="container max-w-4xl py-12 sm:py-16">
      <Link
        href="/"
        className="text-sm text-muted-foreground underline-offset-4 hover:underline"
      >
        Back to the emojis
      </Link>
      <h1 className="mt-6 text-4xl font-bold tracking-tight">Licenses</h1>
      <p className="mt-4 max-w-2xl leading-relaxed text-muted-foreground">
        Fluent Emoji Picker is licensed under MIT-0. Fluent Emoji artwork and
        preview images are licensed by Microsoft under MIT. The open source
        packages below retain their own licenses.
      </p>
      <p className="mt-3 text-sm text-muted-foreground">
        {dependencies.length} dependency notices, generated with
        unplugin-license.
      </p>
      <div className="mt-8 space-y-3">
        {notices.map((entry) => (
          <details
            key={`${entry.name}@${entry.version}`}
            className="rounded-xl border bg-background"
          >
            <summary className="cursor-pointer rounded-xl px-5 py-4 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
              <span className="font-medium">{entry.name}</span>
              {entry.version && (
                <span className="ml-2 text-xs text-muted-foreground">
                  {entry.version}
                </span>
              )}
              <span className="ml-3 text-xs text-muted-foreground">
                {entry.license}
              </span>
            </summary>
            <div className="border-t px-5 py-5">
              {entry.repository && (
                <a
                  href={entry.repository}
                  className="text-sm break-all text-muted-foreground underline underline-offset-4"
                >
                  {entry.repository}
                </a>
              )}
              <pre className="mt-4 font-mono text-xs leading-relaxed wrap-anywhere whitespace-pre-wrap">
                {entry.text ||
                  `License: ${entry.license}. See the source repository for the full license text.`}
              </pre>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
