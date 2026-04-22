/**
 * @jest-environment jsdom
 */

import generateHeading from "./Heading.jsx";
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
    text: "Custom"
  }
};

function renderComponent(extra = {}) {
  const { container } = render(generateHeading(merge(base, extra)));
  return container.firstElementChild;
}

describe("Generates Heading Component", () => {
  test("creates with key and text", () => {
    const el = renderComponent();
    expect(el.tagName.toLowerCase()).toBe("s-heading");
    expect(el.textContent).toBe("Custom");
    // size is stripped for heading in 2026-01
    expect(el.getAttribute("size")).toBeNull();
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
