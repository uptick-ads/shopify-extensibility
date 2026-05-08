import { isEmpty } from "../utilities/present.js";
import { createElement } from "preact";

function resolveTag(type) {
  return type.startsWith("s-") ? type : `s-${type}`;
}

function buildProps({ item, options }) {
  const props = { ...(item.attributes || {}) };

  if (item.url != null) {
    const { loading, nextOffer } = options;
    if (loading != null) {
      props.disabled = loading;
      props.loading = loading;
    }
    if (nextOffer != null) {
      props.onClick = () => nextOffer(item.url);
    }
  }

  return props;
}

export default function generate({
  items,
  options,
  level = 1,
  parentIndex = 0,
  logInfo = false,
  logWarn = true }) {
  options = options ?? {};

  if (items == null || items.length === 0) {
    logInfo && console.info(`No items to generate at level ${level}`);
    return null;
  }

  const elements = [];
  for (let index = 0; index < items.length; index++) {
    const item = items[index];
    const keyIndex = (index + parentIndex) + Math.pow(10, level);
    const keyName = item.name;

    if (isEmpty(item.type)) {
      logWarn && console.warn(`Invalid item type at index ${keyIndex} at level ${level}`);
      continue;
    }

    logInfo && console.info(`Item type of '${item.type}' at index ${keyIndex} for keyName: ${keyName} at level ${level}`);

    let children = [];
    if (item.children != null && item.children.length > 0) {
      children = generate({
        items: item.children,
        options,
        level: level + 1,
        parentIndex: keyIndex,
        logInfo,
        logWarn
      });
    }

    const tag = resolveTag(item.type);
    const content = isEmpty(item.text) ? children : item.text;
    elements.push(createElement(tag, buildProps({ item, options }), content));
  }

  if (elements == null || elements.length === 0) {
    logWarn && console.warn(`Nothing was generated at level ${level}`);
    return null;
  }

  return (
    <>
      {elements}
    </>
  );
}
