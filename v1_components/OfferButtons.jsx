import {
  View
} from "@shopify/ui-extensions-react/checkout";

// Generated
import Generator from "../../extraction/generation/Generator.jsx";

const CONVERT_SECONDARY_BUTTON = true;

export default function OfferButtons({ actions, rejected, rejectOffer }) {
  if (actions == null || actions.length === 0) {
    return false;
  }

  // Hack at the moment to replace button with pressable
  const updatedActions = actions.map(item => {
    if (CONVERT_SECONDARY_BUTTON === true && item != null && item.url != null) {
      item = { ...item };

      item.type = "pressable";

      item.attributes ||= {};
      // Remove button kind
      delete item.attributes.kind;
      // Style like secondary button
      item.attributes.border = "base";
      item.attributes.background = "base";
      item.attributes.padding = "base";
      item.attributes.cornerRadius = "base";
      item.attributes.display = "inline";

      item.children ||= [];
      item.children.push({
        type: "text",
        text: item.text,
        attributes: {
          appearance: "subdued",
          size: "base",
          emphasis: "bold"
        }
      });
      delete item.text;
    }
    return item;
  });

  return (
    <View>
      {
        Generator({
          defaultKeyName: "actions",
          items: updatedActions,
          options: {
            button: {
              rejected: rejected,
              rejectOffer: rejectOffer
            },
            pressable: {
              rejected: rejected,
              rejectOffer: rejectOffer
            }
          }
        })
      }
    </View>
  );
}
