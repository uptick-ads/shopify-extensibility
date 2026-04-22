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
    const el = renderComponent();
    expect(el.tagName.toLowerCase()).toBe("s-paragraph");
    expect(el.textContent).toBe("Custom");
  });

  test("creates as s-text in inline context", () => {
    const el = renderComponent({ parentType: "link" });
    expect(el.tagName.toLowerCase()).toBe("s-text");
    expect(el.textContent).toBe("Custom");
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
  });

  test("creates with children if text is blank", () => {
    const el = renderComponent({
      item: {
        text: ""
      },
      children: "Children"
    });
    expect(el.textContent).toBe("Children");
  });
});