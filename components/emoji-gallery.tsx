"use client";

import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { SkeletonBox } from "skullet/react";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { getEmojiUrl, type Emoji, type CopyFormat } from "#lib/emoji.ts";
import { EmojiCard } from "./emoji-card.tsx";

export default function EmojiGallery({
  showNames,
  emojis,
  copyFormat,
}: {
  showNames: boolean;
  emojis: Emoji[];
  copyFormat: CopyFormat;
}) {
  "use no memo";
  // TanStack Virtual exposes a mutable instance; keep its viewport reactive.
  // The cards and images it renders are still optimized by React Compiler.
  const listRef = useRef<HTMLUListElement>(null);
  // Keep reveal history outside the virtualized cards so scrolling cannot reset it.
  // Each gallery starts empty, keeping its first client render identical to SSR.
  const [revealedImages] = useState(() => new Set<string>());
  const [mounted, setMounted] = useState(false);
  const [animateLayout, setAnimateLayout] = useState(false);
  const [layout, setLayout] = useState({ columns: 8, offset: 480, inset: 0 });
  const rowHeight = showNames ? 124 : 76;
  const virtualizer = useWindowVirtualizer({
    enabled: mounted,
    count: Math.ceil(emojis.length / layout.columns),
    estimateSize: () => rowHeight,
    overscan: 2,
    scrollMargin: layout.offset,
    initialRect: { width: 1024, height: 768 },
  });

  const rows = mounted ? virtualizer.getVirtualItems() : [];
  const totalHeight = mounted
    ? virtualizer.getTotalSize()
    : Math.ceil(emojis.length / layout.columns) * rowHeight;
  const viewportCenter = mounted
    ? (virtualizer.scrollOffset ?? 0) +
      (virtualizer.scrollRect?.height ?? 768) / 2
    : 384;

  // Measure after hydration so restored scroll positions cannot change SSR HTML.
  // Layout measurement and its observers belong to the same synchronization.
  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) {
      return;
    }
    const updateLayout = () => {
      const rect = list.getBoundingClientRect();
      const columns = Math.max(
        1,
        Math.min(emojis.length, Math.floor((rect.width + 12) / 76)),
      );
      const inset = Math.max(0, (rect.width - (columns * 76 - 12)) / 2);
      const offset = rect.top + window.scrollY;
      setLayout((previous) =>
        previous.columns === columns &&
        previous.offset === offset &&
        previous.inset === inset
          ? previous
          : { columns, offset, inset },
      );
    };
    updateLayout();
    setMounted(true);
    virtualizer.measure();
    const frame = requestAnimationFrame(() => setAnimateLayout(true));
    const observer = new ResizeObserver(updateLayout);
    observer.observe(list);
    window.addEventListener("resize", updateLayout);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", updateLayout);
    };
  }, [emojis.length, rowHeight, layout.columns, virtualizer]);

  return (
    <ul
      ref={listRef}
      id="emoji-gallery"
      aria-label="Emoji results"
      className="relative w-full"
      style={{
        height: totalHeight,
        transition: animateLayout ? "height 200ms ease" : undefined,
      }}
    >
      {!mounted && (
        <li
          aria-hidden="true"
          className="sticky top-16 mx-auto list-none"
          style={{
            width: `min(${emojis.length * 76 - 12}px, calc(round(down, calc(100% + 12px), 76px) - 12px))`,
            height: `min(${totalHeight}px, calc(100svh + ${rowHeight}px))`,
            maskImage: `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="76" height="${rowHeight}"><rect width="64" height="64" rx="4" fill="white"/></svg>`)}")`,
            maskSize: `76px ${rowHeight}px`,
            maskRepeat: "repeat",
          }}
        >
          <SkeletonBox width="100%" height="100%" radius={0} />
        </li>
      )}
      {rows.flatMap((row) =>
        emojis
          .slice(row.index * layout.columns, (row.index + 1) * layout.columns)
          .map((emoji, column) => (
            <li
              key={emoji.id}
              aria-setsize={emojis.length}
              aria-posinset={row.index * layout.columns + column + 1}
              className={
                mounted
                  ? "absolute top-0 left-0 w-16 list-none"
                  : "w-16 list-none"
              }
              style={
                {
                  ...(mounted
                    ? {
                        transform: `translate(${layout.inset + column * 76}px, ${row.start - layout.offset}px)`,
                      }
                    : {}),
                  transition: animateLayout
                    ? "transform 240ms cubic-bezier(0.22, 1, 0.36, 1)"
                    : undefined,
                  // Radiate from the viewport center in either scroll direction.
                  "--emoji-reveal-delay": `${Math.round(
                    Math.min(
                      240,
                      Math.hypot(
                        column - (layout.columns - 1) / 2,
                        (row.start + 32 - viewportCenter) / rowHeight,
                      ) * 24,
                    ),
                  )}ms`,
                } as CSSProperties
              }
            >
              <EmojiCard
                revealedImages={revealedImages}
                id={emoji.id}
                name={emoji.name}
                path={getEmojiUrl(emoji)}
                showName={showNames}
                copyFormat={copyFormat}
              />
            </li>
          )),
      )}
    </ul>
  );
}
