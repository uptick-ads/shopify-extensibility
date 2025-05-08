import {
  Button
} from "@shopify/ui-extensions-react/checkout";

import { Fragment } from "react";
import { isEmpty, isPresent } from "../utilities/present";
import { formatAttributes } from "../utilities/formatAttributes";

export function createDynamicAttributes(item, rejected, rejectOffer) {
  // If we don't have a url, it is assumed its a to property, then setup disabled button status only
  if (isEmpty(item.url)) {
    let hrefButton = {
      disabled: rejected,
      loading: rejected
    };
    return { ...item.attributes, ...hrefButton };
  }

  let clickButton = {
    disabled: rejected,
    loading: rejected,
    onPress: () => rejectOffer(item.url)
  };
  return { ...item.attributes, ...clickButton };
}

export function spacesToHTML(text, key) {
  const space = "\u00A0";

  if (text == null) {
    text = "";
  }

  if (text.includes(space) == false) {
    return [text];
  }

  const spaces = (text.split(space).length - 1) / 2;
  const paddingLeft = Array.from({ length: spaces }).map((_, index) => <Fragment key={`${key}-left-${index}`}>&nbsp;</Fragment>);
  const paddingRight = Array.from({ length: spaces }).map((_, index) => <Fragment key={`${key}-right-${index}`}>&nbsp;</Fragment>);
  text = text.replaceAll(space, "");
  return [...paddingLeft, <Fragment key={`${key}-text`}>{text}</Fragment>, ...paddingRight];
}

export default function generateButton({ defaultKeyName, keyIndex, item, children, options }) {
  const keyName = isEmpty(item.name) ? defaultKeyName : item.name;
  const key = `button-${keyName}-${keyIndex}`;

  let attributes = formatAttributes(item);
  if (isPresent(item.url) || isPresent(item.attributes?.to)) {
    const rejected = options?.rejected;
    const rejectOffer = options?.rejectOffer;

    if (rejected == null) {
      console.log("rejected is a required option for generateButton");
    }

    if (rejectOffer == null) {
      console.log("rejectOffer is a required option for generateButton");
    }

    attributes = createDynamicAttributes(item, rejected, rejectOffer);
  }

  let content = null;
  if (isEmpty(item.text)) {
    content = Array.isArray(children) ? children : [children];
  } else {
    content = spacesToHTML(item.text, key);
  }

  return (
    <Button key={key} {...attributes}>
      {content.map(e => e)}
    </Button>
  );
}
