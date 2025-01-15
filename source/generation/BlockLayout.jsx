import {
  BlockLayout
} from "@shopify/ui-extensions-react/checkout";

import { isEmpty } from "../utilities/present";
import { formatAttributes } from "../utilities/formatAttributes";

export default function generateBlockLayout({ defaultKeyName, keyIndex, item, children, _options }) {
  const content = isEmpty(item.text) ? children : item.text;
  const keyName = isEmpty(item.name) ? defaultKeyName : item.name;

  return (
    <BlockLayout key={`block-layout-${keyName}-${keyIndex}`} {...formatAttributes(item)}>
      {content}
    </BlockLayout>
  );
}
