import { defineConfig } from "cf/config";

export default defineConfig({
  worker: {
    name: "fluent-emoji-picker",
    compatibilityDate: "2026-11-09",
    assets: {
      htmlHandling: "auto-trailing-slash",
      notFoundHandling: "404-page",
    },
  },
});
