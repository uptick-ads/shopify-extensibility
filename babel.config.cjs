module.exports = {
  presets: [
    // Preserve Babel 7's compilation target instead of silently adopting the
    // narrower Babel 8 default. Target modernization is a separate change.
    ["@babel/preset-env", {targets: ">= 0%"}],
    ["@babel/preset-react", {runtime: "automatic", importSource: "preact"}],
  ],
};
