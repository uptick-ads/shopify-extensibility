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
  // Add dynamic attributes if we have a url or to property
  if (isPresent(item.url) || isPresent(item.attributes?.to)) {
    const loading = options?.loading;
    const nextOffer = options?.nextOffer;

    if (loading == null) {
      console.log("loading is a required option for generatePressable with url attribute");
    }

    if (nextOffer == null) {
      console.log("nextOffer is a required option for generatePressable with url attribute");
    }

    attributes = createDynamicAttributes(item, loading, nextOffer);
  }

  return (
    <Pressable key={`pressable-${keyName}-${keyIndex}`} {...attributes}>
      {content}
    </Pressable>
  );
}
