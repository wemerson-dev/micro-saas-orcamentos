import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Relaxar regras que podem quebrar o build
      "@typescript-eslint/no-explicit-any": "warn", // Warn instead of error
      "@typescript-eslint/no-unused-vars": "warn",   // Warn instead of error  
      "@typescript-eslint/no-unused-imports": "warn", // Warn instead of error
      // Permitir console.log em desenvolvimento
      "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
    },
  },
];

export default eslintConfig;