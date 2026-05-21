import Generator from "../generation/Generator.jsx";

export default function UptickOffer({ offer, loading, nextOffer, children }) {
  // If we're loading an offer and haven't had one previously, render loading state
  if (loading === true && offer == null) {
    return (
      <s-grid
        gridTemplateColumns="100px auto"
        placeItems="center"
        columnGap="large"
        padding="large"
        border="base"
        borderRadius="base"
      >
        <s-grid-item>
          <s-spinner size="large" />
        </s-grid-item>
        <s-grid-item inlineSize="100%">
          <s-skeleton-paragraph/>
          <s-skeleton-paragraph/>
          <s-skeleton-paragraph/>
        </s-grid-item>
      </s-grid>
    );
  }

  // If we aren't loading and offer is null or false, don't render anything
  if (offer == null || offer === false) {
    return null;
  }

  return (
    <>
      {
        Generator({
          items: offer?.children,
          options: { loading, nextOffer }
        })
      }
      {children}
    </>
  );
}
