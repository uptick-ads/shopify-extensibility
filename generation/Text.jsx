import {
  Text
} from "@shopify/ui-extensions-react/checkout";

import { isEmpty } from "../utilities/present";
import { formatAttributes } from "../utilities/formatAttributes";

export default function generateText({ defaultKeyName, keyIndex, item, children, _options }) {
  const content = isEmpty(item.text) ? children : item.text;
  const keyName = isEmpty(item.name) ? defaultKeyName : item.name;

  return (
    <Text key={`text-${keyName}-${keyIndex}`} {...formatAttributes(item)}>
      {content}
    </Text>
  );
}
