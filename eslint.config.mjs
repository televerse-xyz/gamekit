import globals  from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";

export default [
    {
        ignores : [
            "config/plugins/**/*",
            "dist/**/*",
            "docs/**/*",
        ]
    },
    { files : ["src/**/*.{js,mjs,cjs,ts}",] },
    { languageOptions : { globals : globals.browser } },
    pluginJs.configs.recommended,
    ...tseslint.configs.recommended,
    {
        rules : {
            "@typescript-eslint/no-explicit-any" : "off",
            "@typescript-eslint/ban-ts-comment"  : "off"
        }
    },
    {
        files : [
            "config/**/*.{js,mjs,cjs,ts}",
            "test/**/*.{js,mjs,cjs,ts}"
        ],
        rules : {
            "no-undef" : "off",
        }
    }
];
