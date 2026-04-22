import { isEmpty } from "../utilities/present";
import { formatAttributes } from "../utilities/formatAttributes";
import { translateAttributes } from "../utilities/translateAttributes";

export default function generateIcon({ defaultKeyName, keyIndex, item, _children, _options }) {
  const keyName = isEmpty(item.name) ? defaultKeyName : item.name;

  return (
    <s-icon key={`icon-${keyName}-${keyIndex}`} {...translateAttributes(formatAttributes(item), "icon")}></s-icon>
  );
}
