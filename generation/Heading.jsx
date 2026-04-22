import { isEmpty } from "../utilities/present";
import { formatAttributes } from "../utilities/formatAttributes";
import { translateAttributes } from "../utilities/translateAttributes";

export default function generateHeading({ defaultKeyName, keyIndex, item, children, _options }) {
  const content = isEmpty(item.text) ? children : item.text;
  const keyName = isEmpty(item.name) ? defaultKeyName : item.name;

  return (
    <s-heading key={`heading-${keyName}-${keyIndex}`} {...translateAttributes(formatAttributes(item), "heading")}>
      {content}
    </s-heading>
  );
}
