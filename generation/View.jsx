import { isEmpty } from "../utilities/present";
import { formatAttributes } from "../utilities/formatAttributes";
import { translateAttributes } from "../utilities/translateAttributes";

export default function generateView({ defaultKeyName, keyIndex, item, children, _options }) {
  const content = isEmpty(item.text) ? children : item.text;
  const keyName = isEmpty(item.name) ? defaultKeyName : item.name;

  return (
    <s-box key={`view-${keyName}-${keyIndex}`} {...translateAttributes(formatAttributes(item), "view")}>
      {content}
    </s-box>
  );
}
