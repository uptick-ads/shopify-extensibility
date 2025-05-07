import {
  View,
  InlineLayout,
  BlockSpacer,
  Spinner,
  SkeletonTextBlock
} from "@shopify/ui-extensions-react/checkout";

export default function OfferLoading() {
  return (
    <InlineLayout columns={["auto", 40, "fill"]}>
      <View>
        <BlockSpacer spacing="base" />
        <Spinner size="large" />
      </View>
      <View></View>
      <View>
        <SkeletonTextBlock lines={3} />
      </View>
    </InlineLayout>
  );
}
