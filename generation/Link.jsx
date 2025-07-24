import {
  Link
} from "@shopify/ui-extensions-react/checkout";

import { isEmpty, isPresent } from "../utilities/present";
import { formatAttributes } from "../utilities/formatAttributes";
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
    // TODO: We need to update this on v2
    if (loading != null || nextOffer != null) {
      attributes = createDynamicAttributes(item, loading, nextOffer);
    }
  }

  return (
    <Link key={`link-${keyName}-${keyIndex}`} {...attributes}>
      {content}
    </Link>
  );
}
