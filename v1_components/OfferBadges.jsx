import {
  View,
  Badge,
  InlineLayout,
  InlineSpacer
} from "@shopify/ui-extensions-react/checkout";

import { hideOffers } from "../utilities/offers.js";

export default function OfferBadges({ current, start, total }) {
  if (hideOffers(current, start, total)) {
    return false;
  }

  let offer_badges = [];
  for (let index = start; index <= total; index++) {
    if (index > start) {
      offer_badges.push(<InlineSpacer key={`spacer-${index}`} spacing="tight" />);
    }
    offer_badges.push(<Badge key={`badge-${index}`} tone={index == current ? "default" : "subdued"}>{index}</Badge>);
  }

  return (
    <InlineLayout columns={["fill", "auto", "fill"]}>
      <View>
      </View>
      <View>
        {offer_badges}
      </View>
      <View>
      </View>
    </InlineLayout>
  );
}
