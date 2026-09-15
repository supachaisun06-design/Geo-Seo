import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  site: "https://aeo.bizgrowtech.com",
  output: "hybrid",
  adapter: cloudflare({ mode: "directory" }),
});