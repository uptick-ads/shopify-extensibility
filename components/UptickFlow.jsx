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

export default function UptickOffer({ offer, loading, rejectOffer, children }) {
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
    return (
      <>
        {
          Generator({
            defaultKeyName: "default",
            items: offer?.children,
            options: {
              button: {
                rejected: loading,
                rejectOffer: rejectOffer
              },
              pressable: {
                rejected: loading,
                rejectOffer: rejectOffer
              },
              link: {
                rejected: loading,
                rejectOffer: rejectOffer
              }
            },
            allowEmpty: true
          })
        }
        {children}
      </>
    );
  }

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
          rejected={loading}
          rejectOffer={rejectOffer}
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
