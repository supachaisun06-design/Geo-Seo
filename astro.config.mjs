import { defineConfig } from "astro/config";
import node from "@astrojs/node";

export default defineConfig({
  site: "https://aeo.bizgrowtech.com",
  output: "hybrid",
  adapter: node({ mode: "standalone" }),
});