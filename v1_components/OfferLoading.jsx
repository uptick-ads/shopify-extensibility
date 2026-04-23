export default function OfferLoading() {
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
