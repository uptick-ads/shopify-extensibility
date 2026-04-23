/**
 * @jest-environment jsdom
 */

import generateView from "./View.jsx";
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
  const { container } = render(generateView(merge(base, extra)));
  return container.firstElementChild;
}

describe("Generates View Component", () => {
  test("creates with key and text", () => {
    const vnode = generateView(merge(base, {}));
    expect(vnode.key).toBe("view-test-1");

    const el = renderComponent();
    expect(el.tagName.toLowerCase()).toBe("s-box");
    expect(el.textContent).toBe("Custom");
    expect(el.getAttribute("border")).toBe("dashed");
    expect(el.attributes.length).toBe(1);
  });

  test("creates with children if text is blank", () => {
    const vnode = generateView(merge(base, { item: { text: "" }, children: "Children" }));
    expect(vnode.key).toBe("view-test-1");

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
