import { isEmpty } from "../utilities/present";
import { formatAttributes } from "../utilities/formatAttributes";
import { translateAttributes } from "../utilities/translateAttributes";

export default function generateImage({ defaultKeyName, keyIndex, item, _children, _options }) {
  const keyName = isEmpty(item.name) ? defaultKeyName : item.name;

  return (
    <s-image key={`image-${keyName}-${keyIndex}`} {...translateAttributes(formatAttributes(item), "image")}></s-image>
  );
}
