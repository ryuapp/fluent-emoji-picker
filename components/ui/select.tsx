"use client";

import { Select as SelectPrimitive } from "@base-ui/react/select";
import Check from "lucide-react/icons/check";
import ChevronDown from "lucide-react/icons/chevron-down";

export function Select<Value extends string>({
  label,
  value,
  items,
  onValueChange,
}: {
  label: string;
  value: Value;
  items: { label: string; value: Value }[];
  onValueChange: (value: Value) => void;
}) {
  return (
    <SelectPrimitive.Root
      items={items}
      value={value}
      onValueChange={(next) => {
        if (next !== null) {
          onValueChange(next);
        }
      }}
    >
      <SelectPrimitive.Trigger
        aria-label={label}
        className="flex h-10 min-w-44 items-center justify-between gap-3 rounded-md border bg-background px-3 text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        <SelectPrimitive.Value />
        <SelectPrimitive.Icon>
          <ChevronDown className="size-4" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Positioner
          sideOffset={4}
          className="z-50"
          alignItemWithTrigger={false}
        >
          <SelectPrimitive.Popup className="max-h-[var(--available-height)] min-w-[var(--anchor-width)] overflow-y-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
            <SelectPrimitive.List>
              {items.map((item) => (
                <SelectPrimitive.Item
                  key={item.value}
                  value={item.value}
                  className="flex cursor-pointer items-center justify-between gap-4 rounded-sm px-3 py-2 text-sm outline-none data-highlighted:bg-accent"
                >
                  <SelectPrimitive.ItemText>
                    {item.label}
                  </SelectPrimitive.ItemText>
                  <SelectPrimitive.ItemIndicator>
                    <Check className="size-4" />
                  </SelectPrimitive.ItemIndicator>
                </SelectPrimitive.Item>
              ))}
            </SelectPrimitive.List>
          </SelectPrimitive.Popup>
        </SelectPrimitive.Positioner>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
