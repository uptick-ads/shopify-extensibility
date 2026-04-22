// Generated
import Generator from "../generation/Generator.jsx";

export default function OrderConfirmedHeader({ header }) {
  if (header == null || header.length === 0) {
    return false;
  }

  return (
    <s-box border="base" padding="base" background="subdued">
      {Generator({ defaultKeyName: "header", items: header })}
    </s-box>
  );
}
