import { isEmpty } from "../utilities/present";
import { formatAttributes } from "../utilities/formatAttributes";
import { translateAttributes, translateSpacing } from "../utilities/translateAttributes";

export default function generateNewLine({ defaultKeyName, keyIndex, item }) {
  const keyName = isEmpty(item.name) ? defaultKeyName : item.name;
  const attrs = translateAttributes(formatAttributes(item), "newline");
  const spacing = translateSpacing(attrs.spacing ?? attrs.gap ?? "base");

  return (
    <s-box key={`newline-${keyName}-${keyIndex}`} paddingBlock={spacing}></s-box>
  );
}
