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
  if (isPresent(item.url) || isPresent(item.attributes?.to)) {
    const rejected = options?.rejected;
    const rejectOffer = options?.rejectOffer;

    // If we have callbacks, add to link.
    // TODO: We need to update this on v2
    if (rejected != null || rejectOffer != null) {
      attributes = createDynamicAttributes(item, rejected, rejectOffer);
    }
  }

  return (
    <Link key={`link-${keyName}-${keyIndex}`} {...attributes}>
      {content}
    </Link>
  );
}
