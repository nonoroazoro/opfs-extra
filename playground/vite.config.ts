import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

import type { PluginOption } from "vite";

export default defineConfig({
    base: "/opfs-extra/",
    build: { outDir: "dist" },
    server: { open: true },
    plugins: [(tailwindcss as () => PluginOption)()]
});
