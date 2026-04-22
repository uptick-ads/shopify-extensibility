// Generated
import Generator from "../generation/Generator.jsx";

export default function UptickFooter({ footer }) {
  if (footer == null || footer.length === 0) {
    return false;
  }

  return (
    <s-grid gridTemplateColumns={["fill", "auto"]} padding={["base", "none", "none", "none"]}>
      <s-box>
      </s-box>
      <s-box>
        {Generator({ defaultKeyName: "footer", items: footer })}
      </s-box>
    </s-grid>
  );
}
