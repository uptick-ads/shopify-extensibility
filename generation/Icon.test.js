/**
 * @jest-environment jsdom
 */

import generateIcon from "./Icon.jsx";
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
  const { container } = render(generateIcon(merge(base, extra)));
  return container.firstElementChild;
}

describe("Generates Icon Component", () => {
  test("creates with key and source", () => {
    const el = renderComponent();
    expect(el.tagName.toLowerCase()).toBe("s-icon");
    expect(el.textContent).toBe("");
    expect(el.getAttribute("source")).toBe("arrowDown");
  });
});
