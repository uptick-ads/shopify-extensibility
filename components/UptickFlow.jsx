import Generator from "../generation/Generator.jsx";

export default function UptickOffer({ offer, loading, nextOffer, children }) {
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
          <s-skeleton-paragraph lines="3" />
        </s-box>
      </s-grid>
    );
  }

  // If we aren't loading and offer is null or false, don't render anything
  if (offer == null || offer === false) {
    return <></>;
  }

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
            clickable: {
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
