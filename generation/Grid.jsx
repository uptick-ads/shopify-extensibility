import { isEmpty } from "../utilities/present";
import { formatAttributes } from "../utilities/formatAttributes";
import { translateAttributes } from "../utilities/translateAttributes";

export default function generateGrid({ defaultKeyName, keyIndex, item, children, _options }) {
  const content = isEmpty(item.text) ? children : item.text;
  const keyName = isEmpty(item.name) ? defaultKeyName : item.name;

  return (
    <s-grid key={`grid-${keyName}-${keyIndex}`} {...translateAttributes(formatAttributes(item), "grid")}>
      {content}
    </s-grid>
  );
}
