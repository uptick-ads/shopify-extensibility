import { isEmpty, isPresent } from "../utilities/present";
import { formatAttributes } from "../utilities/formatAttributes";
import { translateAttributes } from "../utilities/translateAttributes";
import { createDynamicAttributes } from "./Button.jsx";

export default function generateLink({ defaultKeyName, keyIndex, item, children, options }) {
  const content = isEmpty(item.text) ? children : item.text;
  const keyName = isEmpty(item.name) ? defaultKeyName : item.name;

  let attributes = formatAttributes(item);
  // Add dynamic attributes if we have a url or to property
  if (isPresent(item.url) || isPresent(item.attributes?.to)) {
    const loading = options?.loading;
    const nextOffer = options?.nextOffer;

    // No logging comment here as we can have links without the options

    // If we have callbacks, add to link.
    if (loading != null || nextOffer != null) {
      attributes = createDynamicAttributes(item, loading, nextOffer);
    }
  }

  attributes = translateAttributes(attributes, "link");

  return (
    <s-link key={`link-${keyName}-${keyIndex}`} {...attributes}>
      {content}
    </s-link>
  );
}
