// We have some default react error warnings that you can't get rid of because of shopify's implementation. Silencing them to not kill the console.
const consoleError = global.console.error;
global.console.error = (message, optional) => {
  if (typeof message === "string" || message instanceof String) {
    // These two errors are specific to shopify
    // Ignore single name components
    if (message.includes("is using incorrect casing. Use PascalCase for React components, or lowercase for HTML elements.")) {
      return;
    }
    // Ignore single name components that it thinks is browser elements.
    if (message.includes("is unrecognized in this browser. If you meant to render a React component, start its name with an uppercase letter")) {
      return;
    }
  }

  consoleError(message, optional);
};
