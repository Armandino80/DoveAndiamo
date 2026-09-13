// @lovable.dev/vite-tanstack-config already includes the core TanStack Start,
// React, Tailwind, Nitro and TypeScript plugins. Keep those centralized here.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1];
const pagesBase =
  process.env.GITHUB_PAGES === "true" && repositoryName ? `/${repositoryName}/` : "/";

export default defineConfig({
  vite: {
    base: pagesBase,
  },
  tanstackStart: {
    // The public build is a client-side app so it can be hosted by GitHub Pages.
    spa: {
      enabled: true,
    },
    // Keep the existing server entry for local/Lovable compatibility during builds.
    server: { entry: "server" },
  },
});
