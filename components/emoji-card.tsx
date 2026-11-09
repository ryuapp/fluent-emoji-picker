"use client";

import { startTransition, useOptimistic, useRef, useState } from "react";
import { Toast } from "@base-ui/react/toast";
import { formatEmojiSvg, type CopyFormat } from "#lib/emoji.ts";
import { EmojiImage } from "#components/emoji-image.tsx";

export function EmojiCard({
  revealedImages,
  id,
  name,
  path,
  showName,
  copyFormat,
}: {
  revealedImages: Set<string>;
  id: number;
  name: string;
  path: string;
  showName: boolean;
  copyFormat: CopyFormat;
}) {
  const toastManager = Toast.useToastManager();
  const [copying, setCopying] = useState(false);
  const [copied, setCopied] = useOptimistic(false);
  const [leaving, setLeaving] = useState(false);
  const busy = useRef(false);

  function copyEmoji() {
    if (busy.current) {
      return;
    }
    busy.current = true;
    setCopying(true);
    setLeaving(false);
    startTransition(async () => {
      setCopied(true);
      let active = true;
      try {
        await Promise.all([
          writeClipboard(),
          (async () => {
            await new Promise<void>((resolve) => setTimeout(resolve, 700));
            if (active) {
              setLeaving(true);
            }
            await new Promise<void>((resolve) => setTimeout(resolve, 100));
          })(),
        ]);
      } catch {
        toastManager.add({
          title: "Could not copy emoji",
          description:
            "Check your connection and clipboard permissions, then try again.",
        });
      } finally {
        active = false;
        busy.current = false;
      }
      // useOptimistic restores false when this Action finishes or fails.
    });

    async function writeClipboard() {
      try {
        const response = await fetch(path);
        if (!response.ok) {
          throw new Error("Could not load the emoji SVG.");
        }
        const svg = await response.text();
        if (
          !/^\s*(?:<\?xml[^>]*>\s*)?(?:<!--[\s\S]*?-->\s*)*<svg\b/i.test(svg)
        ) {
          throw new Error("The response is not an SVG.");
        }
        await navigator.clipboard.writeText(formatEmojiSvg(svg, copyFormat));
      } finally {
        setCopying(false);
      }
    }
  }

  return (
    <div>
      <button
        type="button"
        aria-label={`Copy ${name} SVG`}
        disabled={copying || copied}
        aria-busy={copying}
        onClick={copyEmoji}
        className="relative flex size-16 cursor-pointer items-center justify-center rounded border hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        <EmojiImage
          revealedImages={revealedImages}
          key={path}
          id={id}
          name={name}
          path={path}
          copied={copied && !leaving}
        />
        {copied && (
          <span
            data-leaving={leaving || undefined}
            className="emoji-copy-feedback"
            aria-hidden="true"
          >
            copied!
          </span>
        )}
      </button>
      <span className="sr-only" role="status">
        {copied ? `${name} copied!` : ""}
      </span>
      <div
        title={name}
        aria-hidden={!showName}
        className="emoji-name line-clamp-3 w-16 overflow-hidden text-center text-xs"
        style={{ height: showName ? 48 : 0, opacity: showName ? 1 : 0 }}
      >
        {name}
      </div>
    </div>
  );
}
