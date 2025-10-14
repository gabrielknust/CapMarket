// eslint.config.js
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import prettierConfig from "eslint-config-prettier";

export default tseslint.config(
  eslint.configs.recommended,

  ...tseslint.configs.recommended,

  prettierConfig,
  {
    files: ["**/*.ts"],
    rules: {
      "@typescript-eslint/no-unused-vars": "warn",
      "no-console": "warn",

      semi: ["error", "always"],
      quotes: ["error", "double"],

      "prettier/prettier": "error",
    },
  },
);
