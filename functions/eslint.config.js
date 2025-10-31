import js from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintPluginImport from "eslint-plugin-import";

export default tseslint.config(
  {
    ignores: ["lib/**", "generated/**"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      import: eslintPluginImport,
    },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: ["tsconfig.json", "tsconfig.dev.json"],
        sourceType: "module",
        ecmaVersion: "latest",
      },
    },
    rules: {
      quotes: ["warn", "double", { avoidEscape: true }],
      indent: ["warn", 2, { SwitchCase: 1 }],
      "eol-last": ["warn", "always"],
      "max-len": ["warn", { code: 120, ignoreComments: true, ignoreStrings: true }],
      "no-multi-spaces": "warn",
      "object-curly-spacing": ["warn", "always"],
      "import/no-unresolved": "off",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "require-jsdoc": "off",
      "valid-jsdoc": "off",
    },
  }
);