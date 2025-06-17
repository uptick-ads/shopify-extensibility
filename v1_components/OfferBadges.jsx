import {
  View,
  Badge,
  InlineLayout
} from "@shopify/ui-extensions-react/checkout";

import { hideOffers } from "../utilities/offers.js";

export default function OfferBadges({ current, start, total }) {
  if (hideOffers(current, start, total)) {
    return false;
  }

  let columns = ["fill"];

  let offer_badges = [];
  for (let index = start; index <= total; index++) {
    columns.push("auto");

    offer_badges.push(<View key={`badge-view-${index}`} padding={["none", "tight"]}>
      <Badge key={`badge-${index}`} tone={index == current ? "default" : "subdued"}>{index}</Badge>
    </View>);
  }
  columns.push("fill");

  return (
    <InlineLayout columns={columns}>
      <View>
      </View>
      {offer_badges}
      <View>
      </View>
    </InlineLayout>
  );
}
