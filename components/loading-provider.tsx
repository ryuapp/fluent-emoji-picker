"use client";

import { SkulletProvider } from "skullet/react";
import { useTheme } from "#hooks/use-theme.ts";

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  return (
    <SkulletProvider
      mode={theme}
      reveal="smart"
      theme={{
        animation: "shimmer",
        radius: "4px",
        light: {
          base: "rgb(0 0 0 / 0.035)",
          highlight: "rgb(255 255 255 / 0.6)",
        },
        dark: {
          base: "rgb(255 255 255 / 0.045)",
          highlight: "rgb(255 255 255 / 0.07)",
        },
      }}
    >
      {children}
    </SkulletProvider>
  );
}
