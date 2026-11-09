export type LicenseNotice = {
  name: string;
  version: string;
  license: string;
  repository?: string;
  text: string;
};

// Match the plugin's entry metadata, rather than headings inside license texts.
export function parseLicenseNotices(markdown: string): LicenseNotice[] {
  return markdown
    .split(/\n(?=## [^\n]+\n\n- License: )/)
    .slice(1)
    .map((section) => {
      const heading = /^## (.+)@([^\n]+)\n\n- License: ([^\n]+)/.exec(section);
      if (!heading) {
        throw new Error("Invalid generated license notice");
      }
      const repository = /^- Repository: (https?:\/\/[^\s]+)$/m.exec(
        section,
      )?.[1];
      const text =
        /\n### License\n\n```txt\n([\s\S]*)\n```\s*$/.exec(section)?.[1] ?? "";
      return {
        name: heading[1],
        version: heading[2],
        license: heading[3],
        ...(repository ? { repository } : {}),
        text,
      };
    });
}
