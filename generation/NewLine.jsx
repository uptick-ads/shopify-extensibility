import {
  BlockSpacer
} from "@shopify/ui-extensions-react/checkout";

import { isEmpty } from "../utilities/present";
import { formatAttributes } from "../utilities/formatAttributes";

export default function generateNewLine({ defaultKeyName, keyIndex, item }) {
  const keyName = isEmpty(item.name) ? defaultKeyName : item.name;

  return (
    <BlockSpacer key={`newline-${keyName}-${keyIndex}`} {...formatAttributes(item)} />
  );
}
