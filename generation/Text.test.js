/**
 * @jest-environment jsdom
 */

import generateText from "./Text.jsx";
import {describe, expect, test} from "@jest/globals";
import { render } from "@testing-library/preact";
import merge from "deepmerge";

const base = {
  defaultKeyName: "test",
  keyIndex: 1,
  item: {
    attributes: {
    },
    text: "Custom"
  }
};

function renderComponent(extra = {}) {
  const { container } = render(generateText(merge(base, extra)));
  return container.firstElementChild;
}

describe("Generates Text Component", () => {
  test("creates with key and text as s-paragraph (block context)", () => {
    const vnode = generateText(merge(base, {}));
    expect(vnode.key).toBe("text-test-1");

    const el = renderComponent();
    expect(el.tagName.toLowerCase()).toBe("s-paragraph");
    expect(el.textContent).toBe("Custom");
    expect(el.attributes.length).toBe(0);
  });

  test("creates as s-text in inline context", () => {
    const vnode = generateText(merge(base, { parentType: "link" }));
    expect(vnode.key).toBe("text-test-1");

    const el = renderComponent({ parentType: "link" });
    expect(el.tagName.toLowerCase()).toBe("s-text");
    expect(el.textContent).toBe("Custom");
    expect(el.attributes.length).toBe(0);
  });

  test("creates with emphasis translated to type", () => {
    const el = renderComponent({
      item: {
        attributes: {
          emphasis: "bold"
        }
      }
    });
    // emphasis "bold" → type "strong" for text
    expect(el.getAttribute("type")).toBe("strong");
    expect(el.attributes.length).toBe(1);
  });

  test("creates with children if text is blank", () => {
    const vnode = generateText(merge(base, { item: { text: "" }, children: "Children" }));
    expect(vnode.key).toBe("text-test-1");

    const el = renderComponent({
      item: {
        text: ""
      },
      children: "Children"
    });
    expect(el.textContent).toBe("Children");
    expect(el.attributes.length).toBe(0);
  });
});