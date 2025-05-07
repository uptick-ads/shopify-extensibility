import {
  View,
  InlineLayout,
} from "@shopify/ui-extensions-react/checkout";

// Generated
import Generator from "../../extraction/generation/Generator.jsx";

export default function UptickFooter({ footer }) {
  if (footer == null || footer.length === 0) {
    return false;
  }

  return (
    <InlineLayout columns={["fill", "auto"]}>
      <View>
      </View>
      <View>
        {Generator({ defaultKeyName: "footer", items: footer })}
      </View>
    </InlineLayout>
  );
}
