/**
 * @jest-environment jsdom
 */

import generateBadge from "./Badge.jsx";
import {describe, expect, test} from "@jest/globals";
import { render } from "@testing-library/preact";
import merge from "deepmerge";

const base = {
  defaultKeyName: "test",
  keyIndex: 1,
  item: {
    attributes: {
      size: "small"
    },
    text: "11"
  }
};

function renderComponent(extra = {}) {
  const { container } = render(generateBadge(merge(base, extra)));
  return container.firstElementChild;
}

describe("Generates Badge Component", () => {
  test("creates with key and text", () => {
    const vnode = generateBadge(merge(base, {}));
    expect(vnode.key).toBe("badge-test-1");

    const el = renderComponent();
    expect(el.tagName.toLowerCase()).toBe("s-badge");
    expect(el.textContent).toBe("11");
    expect(el.getAttribute("size")).toBe("small");
    expect(el.attributes.length).toBe(1);
  });

  test("creates with children if text is blank", () => {
    const vnode = generateBadge(merge(base, { item: { text: "" }, children: "Children" }));
    expect(vnode.key).toBe("badge-test-1");

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
