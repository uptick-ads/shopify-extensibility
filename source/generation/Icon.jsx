import {
  Icon
} from "@shopify/ui-extensions-react/checkout";

import { isEmpty } from "../utilities/present";
import { formatAttributes } from "../utilities/formatAttributes";

export default function generateIcon({ defaultKeyName, keyIndex, item, _children, _options }) {
  const keyName = isEmpty(item.name) ? defaultKeyName : item.name;

  return (
    <Icon key={`icon-${keyName}-${keyIndex}`} {...formatAttributes(item)} />
  );
}
