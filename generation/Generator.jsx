// generators
import generateBadge from "./Badge.jsx";
import generateBlockLayout from "./BlockLayout.jsx";
import generateInlineLayout from "./InlineLayout.jsx";
import generateButton from "./Button.jsx";
import generateGrid from "./Grid.jsx";
import generateHeading from "./Heading.jsx";
import generateIcon from "./Icon.jsx";
import generateImage from "./Image.jsx";
import generateLink from "./Link.jsx";
import generateNewLine from "./NewLine.jsx";
import generatePressable from "./Pressable.jsx";
import generateSpacer from "./Spacer.jsx";
import generateText from "./Text.jsx";
import generateView from "./View.jsx";

// Utils
import { isEmpty } from "../utilities/present.js";

export default function generate({
  defaultKeyName,
  items,
  options,
  level = 1,
  parentIndex = 0,
  logInfo = false,
  logWarn = true,
  allowEmpty = false }) {
  options = options ?? {};

  if (items == null || items.length === 0) {
    return false;
  }

  if (isEmpty(defaultKeyName)) {
    logWarn && console.warn(`A defaultKeyName was not present for items: ${items} at level ${level}`);
    return false;
  }

  const elements = [];
  for (let index = 0; index < items.length; index++) {
    const item = items[index];
    // Each child should increment the level and give a unique number, 10, 100, 1000 etc
    const keyIndex = (index + parentIndex) + Math.pow(10, level);
    const defaultChildrenKeyName = isEmpty(item.name) ? defaultKeyName : item.name;

    let element = null;
    let children = [];
    logInfo && console.info(`Item type of '${item.type}' at index ${keyIndex} for defaultKeyName: ${defaultKeyName} at level ${level}`);

    if (item.children != null && item.children.length > 0) {
      children = generate({
        defaultKeyName: defaultChildrenKeyName,
        items: item.children,
        options: options,
        level: level + 1,
        parentIndex: keyIndex,
        logInfo: logInfo,
        logWarn: logWarn,
        allowEmpty: allowEmpty
      });
    }

    // Check that content is present for specific types
    // Can remove when v2 is fully implemented
    if (allowEmpty === false && ["badge", "block_layout", "button", "grid", "heading", "inline_layout", "link", "pressable", "text", "view"].includes(item.type)) {
      if (isEmpty(item.text) && (children == null || children.length === 0)) {
        logWarn && console.warn(`Text and children missing for item type of '${item.type}' at index ${keyIndex} for defaultKeyName: ${defaultKeyName} at level ${level}`);
        continue;
      }
    }

    if (item.type === "badge") {
      element = generateBadge({ defaultKeyName: defaultKeyName, keyIndex: keyIndex, item: item, children: children, options: (options["badge"] || {}) });
    } else if (item.type === "block_layout") {
      element = generateBlockLayout({ defaultKeyName: defaultKeyName, keyIndex: keyIndex, item: item, children: children, options: (options["block_layout"] || {}) });
    } else if (item.type === "button") {
      element = generateButton({ defaultKeyName: defaultKeyName, keyIndex: keyIndex, item: item, children: children, options: (options["button"] || {}) });
    } else if (item.type === "grid") {
      element = generateGrid({ defaultKeyName: defaultKeyName, keyIndex: keyIndex, item: item, children: children, options: (options["grid"] || {}) });
    } else if (item.type === "heading") {
      element = generateHeading({ defaultKeyName: defaultKeyName, keyIndex: keyIndex, item: item, children: children, options: (options["heading"] || {}) });
    } else if (item.type === "icon") {
      element = generateIcon({ defaultKeyName: defaultKeyName, keyIndex: keyIndex, item: item, children: children, options: (options["icon"] || {}) });
    } else if (item.type === "image") {
      element = generateImage({ defaultKeyName: defaultKeyName, keyIndex: keyIndex, item: item, children: children, options: (options["image"] || {}) });
    } else if (item.type === "inline_layout") {
      element = generateInlineLayout({ defaultKeyName: defaultKeyName, keyIndex: keyIndex, item: item, children: children, options: (options["inline_layout"] || {}) });
    } else if (item.type === "link") {
      element = generateLink({ defaultKeyName: defaultKeyName, keyIndex: keyIndex, item: item, children: children, options: (options["link"] || {}) });
    } else if (item.type === "newline") {
      element = generateNewLine({ defaultKeyName: defaultKeyName, keyIndex: keyIndex, item: item, children: children, options: (options["newline"] || {}) });
    } else if (item.type === "pressable") {
      element = generatePressable({ defaultKeyName: defaultKeyName, keyIndex: keyIndex, item: item, children: children, options: (options["pressable"] || {}) });
    } else if (item.type === "spacer") {
      element = generateSpacer({ defaultKeyName: defaultKeyName, keyIndex: keyIndex, item: item, children: children, options: (options["spacer"] || {}) });
    } else if (item.type === "text") {
      element = generateText({ defaultKeyName: defaultKeyName, keyIndex: keyIndex, item: item, children: children, options: (options["text"] || {}) });
    } else if (item.type === "view" || item.type === "modal") { // we don't support modals, default to a view
      element = generateView({ defaultKeyName: defaultKeyName, keyIndex: keyIndex, item: item, children: children, options: (options["view"] || {}) });
    } else {
      logWarn && console.warn(`Unknown item type of '${item.type}' at index ${keyIndex} for defaultKeyName: ${defaultKeyName} at level ${level}`);
    }

    // Add element if it was generated
    if (element != null && element !== false) {
      elements.push(element);
    }
  }

  // If nothing was generated, then don't render
  if (elements == null || elements.length === 0) {
    logWarn && console.warn(`Nothing was generated for defaultKeyName: ${defaultKeyName} at level ${level}`);
    return false;
  }

  return (
    <>
      {elements}
    </>
  );
}
