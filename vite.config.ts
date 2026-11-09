import tailwindcss from "@tailwindcss/vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import { defineConfig } from "vite";
import License from "unplugin-license/vite";
import vinext from "vinext";

// Keep Lucide's client boundary intact in every RSC environment.
const iconOptimization = { exclude: ["lucide-react"] };

export default defineConfig(({ command, isPreview }) => ({
  environments: {
    client: { optimizeDeps: iconOptimization },
    rsc: { optimizeDeps: iconOptimization },
    ssr: { optimizeDeps: iconOptimization },
  },
  plugins: [
    tailwindcss(),
    {
      ...License({
        output: {
          file: new URL("./.vinext/third-party-licenses.md", import.meta.url)
            .href,
        },
      }),
      applyToEnvironment: (environment) => environment.name === "client",
    },
    (command === "build" || isPreview) &&
      cloudflare({
        assetsOnly: true,
        viteEnvironment: { name: "rsc", childEnvironments: ["ssr"] },
        types: { generate: false },
      }),
    vinext({
      react: { compiler: true },
      nextConfig: {
        output: "export",
      },
    }),
  ],
}));
