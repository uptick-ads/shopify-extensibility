/**
 * @jest-environment jsdom
 */

import generateImage from "./Image.jsx";
import {describe, expect, test} from "@jest/globals";
import { render } from "@testing-library/preact";
import merge from "deepmerge";

const base = {
  defaultKeyName: "test",
  keyIndex: 1,
  item: {
    attributes: {
      source: "arrowDown"
    }
  }
};

function renderComponent(extra = {}) {
  const { container } = render(generateImage(merge(base, extra)));
  return container.firstElementChild;
}

describe("Generates Image Component", () => {
  test("creates with key and source", () => {
    const el = renderComponent();
    expect(el.tagName.toLowerCase()).toBe("s-image");
    expect(el.textContent).toBe("");
    // source is renamed to src for image
    expect(el.getAttribute("src")).toBe("arrowDown");
  });
});
