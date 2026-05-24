import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    ".next-static-backup/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Custom server file uses CommonJS
    "server.js",
    // Screenshot helpers are Node/CommonJS scripts, not Next.js source.
    "screenshot*.js",
    // Build helpers are Node/CommonJS scripts, not Next.js source.
    "scripts/**",
  ]),
]);

export default eslintConfig;
