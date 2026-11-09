"use client";

import { useState } from "react";
import ImageOff from "lucide-react/icons/image-off";
import { SkeletonBox } from "skullet/react";
import { getEmojiPreview } from "#lib/emoji/preview.ts";

export function EmojiImage({
  revealedImages,
  id,
  name,
  path,
  copied,
}: {
  revealedImages: Set<string>;
  id: number;
  name: string;
  path: string;
  copied: boolean;
}) {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">(() =>
    revealedImages.has(path) ? "loaded" : "loading",
  );
  const [fallback, setFallback] = useState(false);
  const [revealed, setRevealed] = useState(() => revealedImages.has(path));
  const preview = fallback
    ? { src: path, left: 0, top: 0, width: 32, height: 32 }
    : getEmojiPreview(id, path);
  const imageRef = (image: HTMLImageElement | null) => {
    // A cached image may finish before hydration attaches its load handler.
    if (image?.complete) {
      setStatus(image.naturalWidth > 0 ? "loaded" : "error");
    }
  };

  return (
    <span className="block size-8" aria-busy={status !== "error" && !revealed}>
      {status !== "error" && !revealed && (
        <span
          data-ready={status === "loaded" || undefined}
          className="emoji-preview-placeholder absolute inset-px"
        >
          <SkeletonBox width="100%" height="100%" radius={3} />
        </span>
      )}
      {status === "error" ? (
        <span
          role="img"
          aria-label={`${name} preview unavailable`}
          className="flex size-8 items-center justify-center text-muted-foreground"
        >
          <ImageOff className="size-5" />
        </span>
      ) : (
        <span
          data-copied={copied || undefined}
          className="emoji-copy-image relative block size-8 overflow-hidden"
        >
          <img
            ref={imageRef}
            className={`absolute max-w-none select-none ${status === "loaded" ? (revealed ? "opacity-100" : "emoji-preview-enter") : "opacity-0"}`}
            onAnimationEnd={(event) => {
              if (event.animationName === "emoji-preview-enter") {
                revealedImages.add(path);
                setRevealed(true);
              }
            }}
            style={{
              left: preview.left,
              top: preview.top,
              width: preview.width,
              height: preview.height,
            }}
            src={preview.src}
            alt={name}
            width={preview.width}
            height={preview.height}
            loading="lazy"
            decoding="async"
            onLoad={() => setStatus("loaded")}
            onError={() => {
              if (preview.src !== path) {
                setFallback(true);
                setStatus("loading");
              } else {
                setStatus("error");
              }
            }}
          />
        </span>
      )}
    </span>
  );
}
