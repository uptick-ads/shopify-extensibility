import Generator from "../generation/Generator.jsx";

function findNodeWithHref(node) {
  if (!node || typeof node !== "object") return null;
  if (node.attributes && node.attributes.href) return node;
  if (Array.isArray(node)) {
    for (let item of node) {
      const hit = findNodeWithHref(item);
      if (hit) return hit;
    }
  }
  for (let key of Object.keys(node)) {
    const hit = findNodeWithHref(node[key]);
    if (hit) return hit;
  }
  return null;
}

export function addURLtoOffer(offer) {
  if (offer?.links?.next_offer == null) {
    return offer;
  }
  const action = findNodeWithHref(offer);
  if (action) {
    action.url = offer.links.next_offer;
    action.attributes.external = true;
  }
  return offer;
}

export default function UptickOffer({ offer, loading, nextOffer, rejected, rejectOffer, children }) {
  // Backwards compatibility
  if (loading == null && rejected != null) {
    console.warn("The 'rejected' parameter is deprecated. Please use the 'loading' parameter instead.");
    loading ||= rejected;
  }

  if (nextOffer == null && rejectOffer != null) {
    console.warn("rejectOffer is deprecated, please use nextOffer parameter instead.");
    nextOffer ||= rejectOffer;
  }

  // If we're loading an offer and haven't had one previously, render loading state
  if (loading === true && offer == null) {
    return (
      <s-grid gridTemplateColumns="auto 40 fill">
        <s-box>
          <s-box paddingBlock="base" />
          <s-spinner size="large" />
        </s-box>
        <s-box />
        <s-box>
          <s-skeleton-paragraph lines={3} />
        </s-box>
      </s-grid>
    );
  }

  // If we aren't loading and offer is null or false, don't render anything
  if (offer == null || offer === false) {
    return <></>;
  }

  offer = addURLtoOffer(offer);

  return (
    <>
      {
        Generator({
          defaultKeyName: "default",
          items: offer?.children,
          options: {
            button: {
              loading,
              nextOffer
            },
            pressable: {
              loading,
              nextOffer
            },
            link: {
              loading,
              nextOffer
            }
          }
        })
      }
      {children}
    </>
  );
}
