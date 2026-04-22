import { isEmpty } from "../utilities/present";
import { formatAttributes } from "../utilities/formatAttributes";
import { translateAttributes } from "../utilities/translateAttributes";

export default function generateInlineLayout({ defaultKeyName, keyIndex, item, children, _options }) {
  const content = isEmpty(item.text) ? children : item.text;
  const keyName = isEmpty(item.name) ? defaultKeyName : item.name;
  const attrs = translateAttributes(formatAttributes(item), "inline_layout");

  return (
    <s-grid key={`inline-layout-${keyName}-${keyIndex}`} {...attrs}>
      {content}
    </s-grid>
  );
}
