import js from "@eslint/js";
import stylistic from "@stylistic/eslint-plugin";
import { importX } from "eslint-plugin-import-x";
import jsxA11yX from "eslint-plugin-jsx-a11y-x";
import reactHooks from "eslint-plugin-react-hooks";
import reactJsx from "eslint-plugin-react-jsx";
import reactX from "eslint-plugin-react-x";
import globals from "globals";

const localRules = {
  rules: {
    "no-duplicate-jsx-props": {
      meta: {
        type: "problem",
        docs: {
          description: "Disallow duplicate explicit properties in JSX"
        },
        schema: [],
        messages: {
          duplicate: "Duplicate JSX property '{{name}}'."
        }
      },
      create(context) {
        return {
          JSXOpeningElement(node) {
            const seen = new Set();

            for (const attribute of node.attributes) {
              if (attribute.type !== "JSXAttribute") continue;

              let name;
              if (attribute.name.type === "JSXIdentifier") {
                name = attribute.name.name;
              } else if (attribute.name.type === "JSXNamespacedName") {
                name = `${attribute.name.namespace.name}:${attribute.name.name.name}`;
              } else {
                continue;
              }

              if (seen.has(name)) {
                context.report({
                  node: attribute,
                  messageId: "duplicate",
                  data: { name }
                });
              } else {
                seen.add(name);
              }
            }
          }
        };
      }
    }
  }
};

export default [
  {
    ignores: ["**/coverage/**", "**/dist/**", "**/build/**"]
  },
  {
    ...js.configs.recommended,
    files: ["**/*.{js,jsx}"]
  },
  {
    ...importX.flatConfigs.recommended,
    files: ["**/*.{js,jsx}"]
  },
  {
    ...jsxA11yX.configs.recommended,
    files: ["**/*.{js,jsx}"]
  },
  {
    files: ["**/*.{js,jsx}"],
    linterOptions: {
      reportUnusedDisableDirectives: "warn"
    },
    plugins: {
      "@stylistic": stylistic,
      local: localRules,
      "react-hooks": reactHooks,
      "react-jsx": reactJsx,
      "react-x": reactX
    },
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    settings: {
      "react-x": {
        importSource: "preact"
      }
    },
    rules: {
      "import-x/no-unresolved": ["error", {
        ignore: ["^@shopify/ui-extensions/"]
      }],

      // Preserve the Preact/JSX checks that have direct, runtime-compatible
      // equivalents. Broad React presets include DOM, RSC, and compiler rules
      // that do not describe Shopify's Preact worker renderer.
      "react-x/no-missing-component-display-name": "warn",
      "react-x/no-missing-context-display-name": "warn",
      "react-x/no-missing-key": "error",
      "react-x/no-duplicate-key": "error",
      "react-x/no-component-will-mount": "error",
      "react-x/no-component-will-receive-props": "error",
      "react-x/no-component-will-update": "error",
      "react-x/no-direct-mutation-state": "error",
      "react-x/no-set-state-in-component-did-mount": "error",
      "react-x/no-set-state-in-component-did-update": "error",
      "react-x/no-set-state-in-component-will-update": "error",
      "react-jsx/no-comment-textnodes": "error",
      "local/no-duplicate-jsx-props": "error",

      // Preact follows the same two core Hooks invariants. The additional
      // React Compiler rules in the plugin's broad preset are not enabled.
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      "@stylistic/indent": ["error", 2, {
        ignoredNodes: [
          "JSXAttribute *"
        ]
      }],
      "@stylistic/jsx-indent-props": ["error", 2],
      "@stylistic/jsx-self-closing-comp": "error",
      "@stylistic/linebreak-style": "warn",
      "@stylistic/quotes": ["error", "double"],
      "@stylistic/semi": "error",

      "no-caller": "error",
      "no-duplicate-imports": "error",
      "no-else-return": "warn",
      "no-empty": "off",
      "no-empty-pattern": "off",
      "no-iterator": "error",
      "no-lonely-if": "error",
      "no-multi-str": "warn",
      "no-new-wrappers": "error",
      "no-proto": "error",
      "no-shadow": "off",
      "no-undef-init": "error",
      "no-unneeded-ternary": "error",
      "no-unused-vars": [
        "error", { argsIgnorePattern: "^_" }
      ],
      "no-useless-call": "warn",
      "no-useless-computed-key": "warn",
      "no-useless-concat": "warn",
      "no-useless-constructor": "warn",
      "no-useless-escape": "warn",
      "no-useless-rename": "warn",
      "no-var": "warn",
      "object-shorthand": "warn",
      "prefer-arrow-callback": "warn",
      "prefer-rest-params": "warn",
      "prefer-spread": "warn",
      "prefer-template": "warn",
      radix: "warn",
      strict: ["error", "never"],
      "unicode-bom": "error"
    }
  },
  {
    files: [
      "components/**/*.{js,jsx}",
      "generation/**/*.{js,jsx}",
      "services/**/*.{js,jsx}",
      "utilities/**/*.{js,jsx}"
    ],
    ignores: ["**/*.test.{js,jsx}"],
    languageOptions: {
      globals: {
        ...globals.worker,
        shopify: "readonly"
      }
    }
  },
  {
    // This diagnostic helper deliberately probes for an optional DOM before
    // reading visibility state; the Shopify runtime itself is a worker.
    files: ["utilities/fetchFailureContext.js"],
    languageOptions: {
      globals: {
        document: "readonly"
      }
    }
  },
  {
    files: ["bin/**/*.js"],
    languageOptions: {
      globals: {
        ...globals.node
      }
    }
  },
  {
    files: ["**/*.test.{js,jsx}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.jest,
        ...globals.node,
        shopify: "readonly"
      }
    }
  }
];
