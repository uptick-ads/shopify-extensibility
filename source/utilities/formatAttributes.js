import {
  Style
} from "@shopify/ui-extensions-react/checkout";

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
      if (typeof attributes[key] === "object" && "conditionals" in attributes[key]) {
        // We have a case where it can re-render and causes conditionals to keep previous changes. This stop double conditional rendering
        continue;
      } else {
        attributes[key] = Style.default(attributes[key]).when({viewportInlineSize: {min: "medium"}}, item.desktop_attributes[key]);
      }
    }
  }

  return attributes;
}
