import { isEmpty } from "../utilities/present";
import { formatAttributes } from "../utilities/formatAttributes";
import { translateAttributes, translateSpacing } from "../utilities/translateAttributes";

export default function generateSpacer({ defaultKeyName, keyIndex, item }) {
  const keyName = isEmpty(item.name) ? defaultKeyName : item.name;
  const attrs = translateAttributes(formatAttributes(item), "spacer");
  const spacing = translateSpacing(attrs.spacing ?? attrs.gap ?? "base");

  return (
    <s-box key={`spacer-${keyName}-${keyIndex}`} paddingInline={spacing} />
  );
}
