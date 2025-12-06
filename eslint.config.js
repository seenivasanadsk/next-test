// eslint.config.mjs
import next from "eslint-plugin-next";
import js from "@eslint/js";

export default [
    js.configs.recommended,

    {
        files: ["**/*.{js,jsx,ts,tsx}", "**/*.mjs"],
        plugins: {
            next,
        },
        extends: [
            "plugin:next/recommended",
        ],
        rules: {
            "no-console": "off",
            "no-undef": "error",
            "no-extra-boolean-cast": "warn",
        },
    },
];
