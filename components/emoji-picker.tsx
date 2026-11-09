"use client";

import { useDeferredValue } from "react";
import { debounce, useQueryStates } from "nuqs";
import { NuqsAdapter } from "nuqs/adapters/react";
import { Input } from "@base-ui/react/input";
import EmojiGallery from "#components/emoji-gallery.tsx";
import { EmojiOptions } from "#components/emoji-options.tsx";
import { Select } from "#components/ui/select.tsx";
import { filterEmojis } from "#lib/emoji.ts";
import { emojiCategories, emojiQueryParsers } from "#lib/emoji/query.ts";

export function EmojiPicker() {
  return (
    <NuqsAdapter>
      <EmojiPickerContent />
    </NuqsAdapter>
  );
}

function EmojiPickerContent() {
  const [
    { q: query, category, names: showNames, format: copyFormat },
    setFilters,
  ] = useQueryStates(emojiQueryParsers, {
    shallow: true,
    scroll: false,
    history: "replace",
    clearOnDefault: true,
  });
  const group =
    emojiCategories.find(({ value }) => value === category)?.label ?? "all";
  const deferredQuery = useDeferredValue(query);
  const emojis = filterEmojis(deferredQuery, group);
  function changeCategory(next: string) {
    if (next === category) {
      return;
    }
    void setFilters({ category: next }, { history: "push" });
  }
  return (
    <>
      <div className="flex gap-4">
        <EmojiOptions
          showNames={showNames}
          onShowNamesChange={(names) => {
            void setFilters({ names });
          }}
          copyFormat={copyFormat}
          onCopyFormatChange={(format) => {
            void setFilters({ format });
          }}
        />
      </div>
      <div className="flex flex-wrap items-end gap-3">
        <label className="grid flex-1 gap-2 text-sm font-medium">
          Search emoji
          <Input
            type="search"
            placeholder="Search by name, e.g. cat, heart, rocket…"
            value={query}
            onValueChange={(q) => {
              void setFilters(
                { q },
                { limitUrlUpdates: q ? debounce(250) : undefined },
              );
            }}
            className="h-10 w-full min-w-48 rounded-md border bg-background px-3 font-normal placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          />
        </label>
        <div className="grid gap-2 text-sm font-medium">
          <span aria-hidden="true">Category</span>
          <Select
            label="Category"
            value={category}
            onValueChange={changeCategory}
            items={[
              { value: "all", label: "All categories" },
              ...emojiCategories,
            ]}
          />
        </div>
      </div>
      <p role="status" className="text-sm text-muted-foreground">
        {emojis.length} emoji{emojis.length === 1 ? "" : "s"} found
      </p>
      {emojis.length ? (
        <EmojiGallery
          key={category}
          showNames={showNames}
          emojis={emojis}
          copyFormat={copyFormat}
        />
      ) : (
        <p className="py-8 text-center text-muted-foreground">
          No emojis found. Try another name or category.
        </p>
      )}
    </>
  );
}
