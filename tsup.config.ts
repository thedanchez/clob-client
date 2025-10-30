import { defineConfig } from "tsup";

import pkg from "./package.json";

export default defineConfig({
  name: "polymarket-clob-client",
  entry: ["src/index.ts"],
  format: ["esm"],
  bundle: false,
  clean: true,
  external: [...Object.keys(pkg.dependencies)],
  dts: {
    footer: `declare module '${pkg.name}'`,
  },
});
