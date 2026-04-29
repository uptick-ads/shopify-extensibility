import { isEmpty } from "../utilities/present.js";
import { createElement } from "preact";

function resolveTag(type) {
  return type.startsWith("s-") ? type : `s-${type}`;
}

function resolveOptions(options, type, tag) {
  const unprefixedTag = tag.replace(/^s-/, "");
  return options[type] || options[tag] || options[unprefixedTag] || {};
}

function buildProps({ item, key, typeOptions }) {
  const { loading, nextOffer, ...componentOptions } = typeOptions;
  const props = { key, ...(item.attributes || {}), ...componentOptions };

  if (item.url != null && nextOffer != null) {
    props.disabled = loading;
    props.onClick = () => nextOffer(item.url);
  }

  return props;
}

export default function generate({
  defaultKeyName,
  items,
  options,
  level = 1,
  parentIndex = 0,
  logInfo = false,
  logWarn = true }) {
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
    const keyIndex = (index + parentIndex) + Math.pow(10, level);
    const keyName = isEmpty(item.name) ? defaultKeyName : item.name;
    const defaultChildrenKeyName = keyName;

    logInfo && console.info(`Item type of '${item.type}' at index ${keyIndex} for defaultKeyName: ${defaultKeyName} at level ${level}`);

    let children = [];
    if (item.children != null && item.children.length > 0) {
      children = generate({
        defaultKeyName: defaultChildrenKeyName,
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
    const typeOptions = resolveOptions(options, item.type, tag);
    const element = createElement(tag, buildProps({
      item,
      key: `${item.type}-${keyName}-${keyIndex}`,
      typeOptions
    }), content);

    if (element != null && element !== false) {
      elements.push(element);
    }
  }

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
