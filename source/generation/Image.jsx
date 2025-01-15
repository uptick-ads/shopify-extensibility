import {
  Image
} from "@shopify/ui-extensions-react/checkout";

import { isEmpty } from "../utilities/present";
import { formatAttributes } from "../utilities/formatAttributes";

export default function generateImage({ defaultKeyName, keyIndex, item, _children, _options }) {
  const keyName = isEmpty(item.name) ? defaultKeyName : item.name;

  return (
    <Image key={`image-${keyName}-${keyIndex}`} {...formatAttributes(item)} />
  );
}
