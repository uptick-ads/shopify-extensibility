import {
  InlineSpacer
} from "@shopify/ui-extensions-react/checkout";

import { isEmpty } from "../utilities/present";
import { formatAttributes } from "../utilities/formatAttributes";

export default function generateSpacer({ defaultKeyName, keyIndex, item }) {
  const keyName = isEmpty(item.name) ? defaultKeyName : item.name;

  return (
    <InlineSpacer key={`spacer-${keyName}-${keyIndex}`} {...formatAttributes(item)} />
  );
}
