module.exports = {
  root: true,
  extends: [
    "eslint:recommended",
    "plugin:import/errors",
    "plugin:react/recommended",
    "plugin:jsx-a11y/recommended"
  ],
  plugins: ["react", "import", "jsx-a11y"],
  rules: {
    "react/prop-types": 0,
    indent: ["error", 2, {
      "ignoredNodes": [
        "JSXAttribute *"
      ]
    }],
    "linebreak-style": 1,
    quotes: ["error", "double"],
    "react/react-in-jsx-scope": "off",
    "react/jsx-uses-react": "off",
    "no-unused-vars": [
      "error", { "argsIgnorePattern": "^_" }
    ],
    "semi": 2
  },
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: "module",
    ecmaFeatures: {
      jsx: true
    }
  },
  env: {
    es6: true,
    browser: true,
    node: true
  },
  settings: {
    react: {
      version: "detect"
    }
  }
}
