import { translateSpacing, translateBorderRadius } from "./translateAttributes";

// Translate a single token value (spacing or borderRadius) to the new scale
function translateTokenValue(value) {
  if (value == null) return value;
  if (typeof value === "string") {
    return translateSpacing(value) ?? translateBorderRadius(value) ?? value;
  }
  if (Array.isArray(value)) {
    return value.map(v => translateTokenValue(v));
  }
  return value;
}

// Format a value for use inside a container query string
function formatQueryValue(value) {
  if (Array.isArray(value)) {
    return value.join(" ");
  }
  return String(value);
}

// Default breakpoint for desktop_attributes (medium = 1024px+)
const DEFAULT_BREAKPOINT_PX = 1023;

export function formatAttributes(item) {
  if (item == null) {
    return {};
  }

  let attributes = item.attributes ?? {};
  if (attributes == {}) {
    return {};
  }

  if (item.desktop_attributes == null) {
    return attributes;
  }

  const attributeKeys = Object.keys(attributes);
  const desktopKeys = Object.keys(item.desktop_attributes);
  const intersection = attributeKeys.filter(key => desktopKeys.includes(key));
  if (intersection.length > 0) {
    for (const key of intersection) {
      // Guard against double-conversion
      if (typeof attributes[key] === "string" && attributes[key].startsWith("@container")) {
        continue;
      }

      const mobileValue = translateTokenValue(attributes[key]);
      const desktopValue = translateTokenValue(item.desktop_attributes[key]);

      attributes[key] = `@container (inline-size > ${DEFAULT_BREAKPOINT_PX}px) ${formatQueryValue(desktopValue)}, ${formatQueryValue(mobileValue)}`;
    }
  }

  return attributes;
}
