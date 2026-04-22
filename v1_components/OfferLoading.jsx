export default function OfferLoading() {
  return (
    <s-grid gridTemplateColumns="auto 40 fill">
      <s-box>
        <s-box paddingBlock="base"></s-box>
        <s-spinner size="large"></s-spinner>
      </s-box>
      <s-box></s-box>
      <s-box>
        <s-skeleton-paragraph lines={3}></s-skeleton-paragraph>
      </s-box>
    </s-grid>
  );
}
