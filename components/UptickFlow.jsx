import {
  View,
  BlockSpacer
} from "@shopify/ui-extensions-react/checkout";

// v1 Components
import OrderConfirmedHeader from "../v1_components/OrderConfirmedHeader.jsx";
import UptickFooter from "../v1_components/UptickFooter.jsx";
import OfferBadges from "../v1_components/OfferBadges.jsx";
import OfferButtons from "../v1_components/OfferButtons.jsx";
import OfferLoading from "../v1_components/OfferLoading.jsx";
import OfferImageWrapper from "../v1_components/OfferImageWrapper.jsx";

// Generated
import Generator from "../generation/Generator.jsx";

// Utils
import { isPresent } from "../utilities/present.js";
import { hideOffers } from "../utilities/offers.js";

export function addURLtoV1(offer) {
  if (offer?.attributes?.actions != null && offer?.links?.next_offer != null) {
    offer.attributes.actions.forEach(action => {
      // Assumption is accept only has a "to" property at the moment
      if (action?.attributes?.to != null) {
        action.url = offer.links.next_offer; // Add url to the property so that we do the callback on click
        action.attributes.external = true; // Mark as external link
      }
    });
  }
  return offer;
}

// re-use your finder from before
function findNodeWithTo(node) {
  if (!node || typeof node !== "object") return null;
  if (node.attributes && node.attributes.to) return node;
  if (Array.isArray(node)) {
    for (let item of node) {
      const hit = findNodeWithTo(item);
      if (hit) return hit;
    }
  }
  for (let key of Object.keys(node)) {
    const hit = findNodeWithTo(node[key]);
    if (hit) return hit;
  }
  return null;
}

export function addURLtoV2(offer) {
  if (offer?.links?.next_offer == null) {
    return offer;
  }
  const action = findNodeWithTo(offer);
  if (action) {
    action.url = offer.links.next_offer; // Add url to the property so that we do the callback on click
    action.attributes.external = true; // Mark as external link
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

  // If we're loading an offer and haven't had one previously, render component
  if (loading === true && offer == null) {
    return (
      <>
        <OfferLoading />
      </>
    );
  }

  // If we aren't loading and offer is null or false, don't render anything
  // Either all offers have been shown, or no offers are available
  if (offer == null || offer === false) {
    return (
      <></>
    );
  }



  // See if we have a v2 offer, and if so render it
  if (offer.api_version === "v2") {
    offer = addURLtoV2(offer);
    return (
      <>
        {
          Generator({
            defaultKeyName: "default",
            items: offer?.children,
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
            },
            allowEmpty: true
          })
        }
        {children}
      </>
    );
  }

  offer = addURLtoV1(offer);
  // Fallback to v1 rendering
  let hasOffer = hideOffers(offer?.attributes?.offers?.current, offer?.attributes?.offers?.start, offer?.attributes?.offers?.size) === false;
  let hasPersonalization = (offer?.attributes?.personalization || []).length > 0;
  let hasDescriptionOrImage = (offer?.attributes?.content || []).length > 0 || isPresent(offer?.attributes?.image?.url);

  return (
    <View>
      <OrderConfirmedHeader
        header={offer?.attributes?.header}
      />
      <View border="base" padding="base">
        {Generator({ defaultKeyName: "personalization", items: offer?.attributes?.personalization })}
        { hasPersonalization && hasOffer && <BlockSpacer spacing="loose" /> }
        <OfferBadges
          current={offer?.attributes?.offers?.current}
          start={offer?.attributes?.offers?.start}
          total={offer?.attributes?.offers?.size}
        />
        { hasDescriptionOrImage && (hasOffer || hasPersonalization) && <BlockSpacer spacing="loose" /> }
        <OfferImageWrapper image_url={offer?.attributes?.image?.url} >
          {Generator({ defaultKeyName: "sponsored", items: offer?.attributes?.sponsored })}
          {Generator({ defaultKeyName: "content", items: offer?.attributes?.content })}
        </OfferImageWrapper>
        <BlockSpacer spacing="loose" />
        <OfferButtons
          actions={offer?.attributes?.actions}
          loading={loading}
          nextOffer={nextOffer}
        />
        { (offer?.attributes?.disclaimer || []).length > 0 && <BlockSpacer spacing="extraTight" /> }
        {Generator({ defaultKeyName: "disclaimer", items: offer?.attributes?.disclaimer })}
        <UptickFooter
          footer={offer.attributes.footer}
        />
      </View>
      {children}
    </View>
  );
}
