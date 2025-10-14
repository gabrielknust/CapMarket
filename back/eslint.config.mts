// eslint.config.js
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import prettierConfig from "eslint-config-prettier";

export default tseslint.config(
  // 1. Configuração base do ESLint
  eslint.configs.recommended,

  // 2. Configurações recomendadas para TypeScript
  // Isso substitui a sua tentativa de espalhar as regras manualmente
  ...tseslint.configs.recommended,

  // 3. Configuração do Prettier para desativar regras conflitantes
  // IMPORTANTE: Este deve vir depois das outras regras
  prettierConfig,

  // 4. Sua configuração personalizada (overrides)
  {
    files: ["**/*.ts"],
    rules: {
      // Regras de Qualidade de Código (ESLint e TypeScript)
      "@typescript-eslint/no-unused-vars": "warn",
      "no-console": "warn",

      // Regras de Estilo (você pode deixar o Prettier cuidar disso)
      semi: ["error", "always"],
      quotes: ["error", "double"],

      // Ativa a regra do Prettier para reportar diferenças como erros do ESLint
      "prettier/prettier": "error",
    },
  },
);
