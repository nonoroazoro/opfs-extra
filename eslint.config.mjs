import { ESLINT_CONFIGS } from "eslint-config-zoro/eslint";
import { STYLISTIC_CONFIGS } from "eslint-config-zoro/stylistic";
import { TYPESCRIPT_CONFIGS } from "eslint-config-zoro/typescript";

export default [
    ...ESLINT_CONFIGS,
    ...STYLISTIC_CONFIGS,
    ...TYPESCRIPT_CONFIGS,
    {
        languageOptions: {
            parserOptions: {
                project: "./tsconfig.eslint.json"
            }
        }
    }
];
