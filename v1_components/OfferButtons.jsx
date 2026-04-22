// Generated
import Generator from "../generation/Generator.jsx";

const CONVERT_SECONDARY_BUTTON = true;

export default function OfferButtons({ actions, loading, nextOffer }) {
  if (actions == null || actions.length === 0) {
    return false;
  }

  let allButtons = true;
  // Hack at the moment to replace button with pressable
  const updatedActions = actions.map(item => {
    if (CONVERT_SECONDARY_BUTTON === true && item != null && item.type === "button" && item.url != null && item.attributes?.to == null) {
      item = { ...item };

      item.type = "pressable";

      item.attributes ||= {};
      // Remove button kind
      delete item.attributes.kind;
      // Style like secondary button
      item.attributes.border = "base";
      item.attributes.background = "base";
      item.attributes.padding = "base";
      item.attributes.borderRadius = "base";
      item.attributes.inlineAlignment = "center";

      item.children ||= [];
      item.children.push({
        type: "text",
        text: item.text,
        attributes: {
          color: "subdued",
          type: "strong"
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
    <s-grid
      gridTemplateColumns={"@container (inline-size > 767px) auto 20px auto, fill"}
      gridTemplateRows={allButtons ? "@container (inline-size > 767px) fill, fill 15px fill" : "@container (inline-size > 767px) fill, fill 0% fill"}
      gap="none" >
      {
        Generator({
          defaultKeyName: "actions",
          items: updatedActions,
          options: {
            button: {
              loading: loading,
              nextOffer: nextOffer
            },
            pressable: {
              loading: loading,
              nextOffer: nextOffer
            },
            link: {
              loading: loading,
              nextOffer: nextOffer
            }
          }
        })
      }
    </s-grid>
  );
}
