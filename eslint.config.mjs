import preact from "eslint-config-preact";
import importPlugin from "eslint-plugin-import";
import jsxA11y from "eslint-plugin-jsx-a11y";

export default [
  ...preact,
  importPlugin.flatConfigs.recommended,
  jsxA11y.flatConfigs.recommended,
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    rules: {
      "react/prop-types": 0,
      indent: ["error", 2, {
        "ignoredNodes": [
          "JSXAttribute *"
        ]
      }],
      "linebreak-style": 1,
      quotes: ["error", "double"],
      "no-unused-vars": [
        "error", { "argsIgnorePattern": "^_" }
      ],
      "semi": 2
    }
  }
];
