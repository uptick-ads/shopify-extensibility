// Translates legacy Shopify UI extension attribute names/values to 2026-01 web component equivalents.
// Used by both generation components and v1 hardcoded components.

const SPACING_MAP = {
  "extraTight": "small-200",
  "tight": "small",
  "base": "base",
  "loose": "large",
  "extraLoose": "large-200",
  "none": "none",
};

const BORDER_RADIUS_MAP = {
  "base": "base",
  "small": "small",
  "large": "large",
  "fullyRounded": "max",
  "none": "none",
};

const EMPHASIS_MAP = {
  "bold": "strong",
  "italic": "emphasis",
};

const APPEARANCE_TO_COLOR_MAP = {
  "subdued": "subdued",
  "info": "info",
  "success": "success",
  "warning": "warning",
  "critical": "critical",
  "decorative": "decorative",
};

// Props that are renamed across all/most components
const PROP_RENAMES = {
  "to": "href",
  "onPress": "onClick",
  "cornerRadius": "borderRadius",
};

// Props renamed only for specific component types
const TYPE_PROP_RENAMES = {
  "image": { "source": "src" },
  "grid": { "columns": "gridTemplateColumns", "rows": "gridTemplateRows", "spacing": "gap" },
  "block_layout": { "spacing": "gap" },
  "inline_layout": { "columns": "gridTemplateColumns", "rows": "gridTemplateRows", "spacing": "gap" },
};

// Props to strip entirely for specific component types
const STRIP_PROPS = {
  "heading": ["size"],
};

const SPACING_PROPS = ["padding", "gap", "spacing", "paddingBlock", "paddingInline", "paddingBlockStart", "paddingBlockEnd", "paddingInlineStart", "paddingInlineEnd"];

export function translateSpacing(value) {
  if (value == null) return value;
  if (typeof value === "string") {
    return SPACING_MAP[value] ?? value;
  }
  if (Array.isArray(value)) {
    return value.map(v => translateSpacing(v));
  }
  return value;
}

export function translateBorderRadius(value) {
  if (value == null) return value;
  if (typeof value === "string") {
    return BORDER_RADIUS_MAP[value] ?? value;
  }
  return value;
}

export function translateAttributes(attributes, componentType) {
  if (attributes == null) return {};

  const result = {};
  const typeRenames = TYPE_PROP_RENAMES[componentType] || {};
  const stripSet = new Set(STRIP_PROPS[componentType] || []);

  for (const [key, value] of Object.entries(attributes)) {
    // Strip props that are removed for this component type
    if (stripSet.has(key)) continue;

    // Rename props
    let newKey = PROP_RENAMES[key] ?? typeRenames[key] ?? key;

    let newValue = value;

    // Translate spacing values
    if (SPACING_PROPS.includes(newKey) || SPACING_PROPS.includes(key)) {
      newValue = translateSpacing(newValue);
    }

    // Translate borderRadius values
    if (newKey === "borderRadius" || key === "cornerRadius") {
      newValue = translateBorderRadius(newValue);
    }

    // Translate text-specific props
    if (key === "appearance" && (componentType === "text" || componentType === "link" || componentType === "badge")) {
      newKey = "color";
      newValue = APPEARANCE_TO_COLOR_MAP[value] ?? value;
    }

    if (key === "emphasis" && componentType === "text") {
      newKey = "type";
      newValue = EMPHASIS_MAP[value] ?? value;
    }

    // Translate size on text — only "small" maps to type
    if (key === "size" && componentType === "text") {
      if (value === "small" || value === "extraSmall") {
        newKey = "type";
        newValue = "small";
      } else {
        // No size prop on s-text/s-paragraph; drop medium/large/etc
        continue;
      }
    }

    // Translate button kind → variant
    if (key === "kind" && componentType === "button") {
      newKey = "variant";
    }

    result[newKey] = newValue;
  }

  return result;
}
