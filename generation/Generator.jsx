import { isEmpty } from "../utilities/present.js";
import { createElement } from "preact";
import { useRef, useState } from "preact/hooks";
import { holds, visibleValues } from "./interactions.js";

function resolveTag(type) {
  return type.startsWith("s-") ? type : `s-${type}`;
}

// An item (`data.target: "item"`) such as the feedback survey owns the values its fields collect, scoped to that one item.
// It renders its own node again with `itemScope` set, which every node below it reads to find those values.
function Item({ item, options, level, parentIndex, logInfo, logWarn }) {
  const [fields, setFields] = useState({});
  const [posting, setPosting] = useState(false);
  // A ref rather than state, so a second click in the same tick already sees the first one's lock.
  const advancing = useRef(false);
  const itemOptions = {
    ...options,
    itemScope: {
      root: item,
      fields,
      setField: (name, value) => setFields((current) => ({ ...current, [name]: value })),
      posting,
      // Every link in the item leads to the same next offer, so once one is clicked the others do nothing and the item advances only once.
      advance: async (url, before) => {
        if (advancing.current) return;
        advancing.current = true;
        if (before != null) {
          setPosting(true);
          // A failed event still advances, so a postEvent that rejects can't leave the item locked.
          try {
            await before();
          } catch {
            // postEvent reports its own failures.
          }
        }
        options.nextOffer(url);
      },
    },
  };
  return renderItem({ item, options: itemOptions, level, parentIndex, logInfo, logWarn });
}

function buildProps({ item, options }) {
  // `selected` holds the attributes a field segment takes while its value is picked, so it never reaches the element.
  const { selected, ...attributes } = item.attributes || {};
  const props = { ...attributes };
  // Fields and click events only work inside an item, which holds the values they read and write.
  const scope = options.itemScope;
  const field = scope != null ? item.field : null;

  if (field?.name != null) {
    const current = scope.fields[field.name];
    // A field with a `value` is a choice: clicking picks that value, and clicking it again clears it.
    // A field without one is a text box that stores whatever the shopper types.
    if (field.value !== undefined) {
      if (current === field.value && selected != null) {
        Object.assign(props, selected);
      }
      // A press button tells assistive technology whether it is pressed, so a picked reason reads as selected.
      if (item.type === "press-button") {
        props.pressed = current === field.value;
      }
      props.onClick = () => scope.setField(field.name, current === field.value ? null : field.value);
    } else {
      props.value = current ?? "";
      const update = (event) => scope.setField(field.name, event?.currentTarget?.value ?? event?.target?.value ?? "");
      props.onInput = update;
      props.onChange = update;
    }
  }

  if (item.url != null) {
    const { loading, nextOffer, postEvent } = options;
    // An item's links stay disabled while its event posts, since nextOffer's loading only starts once the post is done.
    const busy = loading || scope?.posting;
    if (busy != null) {
      props.disabled = busy;
      props.loading = busy;
    }
    if (nextOffer != null && scope != null) {
      const click = item.events?.click;
      // A failed event still moves the shopper on; postEvent has already reported it.
      const send = click != null && postEvent != null && holds(click.send_when, scope.fields)
        ? () => postEvent(click, visibleValues(scope.root, click.fields || [], scope.fields))
        : null;
      props.onClick = () => scope.advance(item.url, send);
    } else if (nextOffer != null) {
      props.onClick = () => nextOffer(item.url);
    }
  }

  return props;
}

function renderItem({ item, options, level, parentIndex, logInfo, logWarn }) {
  const scope = options.itemScope;

  // An item node seen for the first time goes to Item, which sets up its field values and renders this node again inside that scope.
  if (scope == null && item.data?.target === "item") {
    // Keyed by the item's id so a different item in the same place starts with empty fields instead of the last one's answers.
    return createElement(Item, { key: item.data?.item_id, item, options, level, parentIndex, logInfo, logWarn });
  }

  // Inside an item, a node whose `show_when` doesn't hold for the current field values renders nothing, nor do its children.
  if (scope != null && item.show_when != null && !holds(item.show_when, scope.fields)) {
    return null;
  }

  let children = [];
  if (item.children != null && item.children.length > 0) {
    children = generate({
      items: item.children,
      options,
      level: level + 1,
      parentIndex,
      logInfo,
      logWarn
    });
  }

  const tag = resolveTag(item.type);
  const content = isEmpty(item.text) ? children : item.text;
  return createElement(tag, buildProps({ item, options }), content);
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

    const element = renderItem({ item, options, level, parentIndex: keyIndex, logInfo, logWarn });
    if (element != null) {
      elements.push(element);
    }
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
