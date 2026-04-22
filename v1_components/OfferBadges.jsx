import { hideOffers } from "../utilities/offers.js";

export default function OfferBadges({ current, start, total }) {
  if (hideOffers(current, start, total)) {
    return false;
  }

  let columns = ["fill"];

  let offer_badges = [];
  for (let index = start; index <= total; index++) {
    columns.push("auto");

    offer_badges.push(<s-box key={`badge-view-${index}`} padding="none small">
      <s-badge key={`badge-${index}`} tone={index == current ? "default" : "subdued"}>{index}</s-badge>
    </s-box>);
  }
  columns.push("fill");

  return (
    <s-grid gridTemplateColumns={columns.join(" ")}>
      <s-box>
      </s-box>
      {offer_badges}
      <s-box>
      </s-box>
    </s-grid>
  );
}
