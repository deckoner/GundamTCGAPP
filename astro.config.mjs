import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import vercel from "@astrojs/vercel";
import node from "@astrojs/node";

const isDeploy = Boolean(process.env.VERCEL);

export default defineConfig({
  output: "server",
  adapter: isDeploy ? vercel() : node({ mode: "standalone" }),
  vite: {
    plugins: [tailwindcss()],
  },
});
