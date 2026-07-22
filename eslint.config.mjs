import { defineConfig } from "eslint/config";
import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default defineConfig([{
    extends: compat.extends("plugin:prettier/recommended"),

    languageOptions: {
        globals: {
            ...globals.node,
        },

        ecmaVersion: 6,
        sourceType: "module",
    },

    rules: {
        "no-console": 2,
        "no-const-assign": 2,

        "no-undef": ["error", {
            typeof: true,
        }],

        "no-unused-vars": [2, {
            vars: "all",
            args: "none",
        }],

        "prefer-const": 1,
    },
}]);