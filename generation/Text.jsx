import { isEmpty } from "../utilities/present";
import { formatAttributes } from "../utilities/formatAttributes";
import { translateAttributes } from "../utilities/translateAttributes";

export default function generateText({ defaultKeyName, keyIndex, item, children, _options, parentType }) {
  const content = isEmpty(item.text) ? children : item.text;
  const keyName = isEmpty(item.name) ? defaultKeyName : item.name;
  const attrs = translateAttributes(formatAttributes(item), "text");
  const isInline = ["text", "link", "paragraph", "button", "heading"].includes(parentType);

  if (isInline) {
    return (
      <s-text key={`text-${keyName}-${keyIndex}`} {...attrs}>
        {content}
      </s-text>
    );
  }

  return (
    <s-paragraph key={`text-${keyName}-${keyIndex}`} {...attrs}>
      {content}
    </s-paragraph>
  );
}
