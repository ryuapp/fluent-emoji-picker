"use client";

import { Switch } from "#components/ui/switch.tsx";
import { Select } from "#components/ui/select.tsx";
import type { CopyFormat } from "#lib/emoji.ts";

export function EmojiOptions({
  showNames,
  onShowNamesChange,
  copyFormat,
  onCopyFormatChange,
}: {
  showNames: boolean;
  onShowNamesChange: (checked: boolean) => void;
  copyFormat: CopyFormat;
  onCopyFormatChange: (format: CopyFormat) => void;
}) {
  return (
    <div>
      <h2 className="mb-2">Options</h2>
      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-sm font-medium">
          Name
          <Switch checked={showNames} onCheckedChange={onShowNamesChange} />
        </label>
        <Select
          label="Copy format"
          value={copyFormat}
          onValueChange={onCopyFormatChange}
          items={[
            { value: "svg", label: "SVG (default)" },
            { value: "class", label: "Tailwind CSS class" },
            { value: "className", label: "Tailwind CSS className" },
          ]}
        />
      </div>
    </div>
  );
}
