import { isEmpty } from "../utilities/present";
import { formatAttributes } from "../utilities/formatAttributes";
import { translateAttributes } from "../utilities/translateAttributes";

export default function generateBadge({ defaultKeyName, keyIndex, item, children, _options }) {
  const content = isEmpty(item.text) ? children : item.text;
  const keyName = isEmpty(item.name) ? defaultKeyName : item.name;

  return (
    <s-badge key={`badge-${keyName}-${keyIndex}`} {...translateAttributes(formatAttributes(item), "badge")}>
      {content}
    </s-badge>
  );
}
