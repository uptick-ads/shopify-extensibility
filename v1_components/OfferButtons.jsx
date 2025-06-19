import {
  Grid,
  Style
} from "@shopify/ui-extensions-react/checkout";

// Generated
import Generator from "../generation/Generator.jsx";

const CONVERT_SECONDARY_BUTTON = true;

export default function OfferButtons({ actions, rejected, rejectOffer }) {
  if (actions == null || actions.length === 0) {
    return false;
  }

  let allButtons = true;
  // Hack at the moment to replace button with pressable
  const updatedActions = actions.map(item => {
    if (CONVERT_SECONDARY_BUTTON === true && item != null && item.type === "button" && item.url != null) {
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
      item.attributes.inlineAlignment = "center";

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
    } else if (item != null && item.type === "link") {
      allButtons = false;
      item = {
        type: "view",
        attributes: {
          blockAlignment: "center",
          inlineAlignment: "center"
        },
        children: [item]
      };
    }
    return item;
  });

  return (
    <Grid
      columns={Style.default(["fill"]).when({ viewportInlineSize: { min: "small" }}, ["auto", "20px", "auto"])}
      rows={Style.default(["fill", (allButtons ? "15px" : "0%"), "fill"]).when({ viewportInlineSize: { min: "small" }}, ["fill"])}
      spacing="none" >
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
            },
            link: {
              rejected: rejected,
              rejectOffer: rejectOffer
            }
          }
        })
      }
    </Grid>
  );
}
