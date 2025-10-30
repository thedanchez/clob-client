import { defineConfig } from "tsup";

import pkg from "./package.json";

export default defineConfig({
  name: "polymarket-clob-client",
  entry: ["src/index.ts"],
  format: ["esm"],
  bundle: true,
  clean: true,
  sourcemap: true,
  splitting: true,
  dts: {
    footer: `declare module '${pkg.name}'`,
  },
});
