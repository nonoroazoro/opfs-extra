import { defineConfig } from "eslint-config-zoro";

export default defineConfig({
    typescript: true,
    languageOptions: {
        parserOptions: {
            project: "./tsconfig.eslint.json"
        }
    }
});
