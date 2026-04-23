// Utils
import { isEmpty } from "../utilities/present.js";

const MAX_BLOCK_SIZE = 150;
const MAX_INLINE_SIZE = 150;

export default function OfferImageWrapper({ image_url, children }) {
  if (isEmpty(image_url)) {
    return <>
      {children}
    </>;
  }

  return (
    <s-grid gridTemplateColumns={
        "@container (inline-size > 1023px) fill auto, fill"
      }
      gridTemplateRows={"auto"}
      gap={"large"}
    >
      <s-box display={
          "@container (inline-size > 1023px) none, auto"
        }
        inlineAlignment={"center"}
      >
        <s-box
          maxBlockSize={MAX_BLOCK_SIZE}
          maxInlineSize={MAX_INLINE_SIZE}>
          <s-image src={image_url} />
        </s-box>
      </s-box>
      <s-box>
        {children}
      </s-box>
      <s-box display={
          "@container (inline-size > 1023px) auto, none"
        }
        blockAlignment={"end"}
      >
        <s-box
          maxBlockSize={MAX_BLOCK_SIZE}
          maxInlineSize={MAX_INLINE_SIZE}>
          <s-image src={image_url} />
        </s-box>
      </s-box>
    </s-grid>
  );
}
