import {
  Pressable
} from "@shopify/ui-extensions-react/checkout";

import { isEmpty, isPresent } from "../utilities/present";
import { formatAttributes } from "../utilities/formatAttributes";
import { createDynamicAttributes } from "./Button.jsx";

export default function generatePressable({ defaultKeyName, keyIndex, item, children, options }) {
  const content = isEmpty(item.text) ? children : item.text;
  const keyName = isEmpty(item.name) ? defaultKeyName : item.name;

  let attributes = formatAttributes(item);
  if (isPresent(item.url) || isPresent(item.attributes?.to)) {
    const rejected = options?.rejected;
    const rejectOffer = options?.rejectOffer;

    if (rejected == null) {
      console.log("rejected is a required option for generatePressable with link");
    }

    if (rejectOffer == null) {
      console.log("rejectOffer is a required option for generatePressable with link");
    }

    attributes = createDynamicAttributes(item, rejected, rejectOffer);
  }

  return (
    <Pressable key={`pressable-${keyName}-${keyIndex}`} {...attributes}>
      {content}
    </Pressable>
  );
}
