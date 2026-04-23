/**
 * @jest-environment jsdom
 */

import generateInlineLayout from "./InlineLayout.jsx";
import {describe, expect, test} from "@jest/globals";
import { render } from "@testing-library/preact";
import merge from "deepmerge";

const base = {
  defaultKeyName: "test",
  keyIndex: 1,
  item: {
    attributes: {
      border: "dashed"
    },
    text: "Custom"
  }
};

function renderComponent(extra = {}) {
  const { container } = render(generateInlineLayout(merge(base, extra)));
  return container.firstElementChild;
}

describe("Generates Inline Layout Component", () => {
  test("creates with key and text", () => {
    const vnode = generateInlineLayout(merge(base, {}));
    expect(vnode.key).toBe("inline-layout-test-1");

    const el = renderComponent();
    expect(el.tagName.toLowerCase()).toBe("s-grid");
    expect(el.textContent).toBe("Custom");
    expect(el.getAttribute("border")).toBe("dashed");
    expect(el.attributes.length).toBe(1);
  });

  test("creates with children if text is blank", () => {
    const vnode = generateInlineLayout(merge(base, { item: { text: "" }, children: "Children" }));
    expect(vnode.key).toBe("inline-layout-test-1");

    const el = renderComponent({
      item: {
        text: ""
      },
      children: "Children"
    });
    expect(el.textContent).toBe("Children");
    expect(el.attributes.length).toBe(1);
  });
});
