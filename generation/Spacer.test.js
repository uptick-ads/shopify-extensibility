/**
 * @jest-environment jsdom
 */

import generateSpacer from "./Spacer.jsx";
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
  const { container } = render(generateSpacer(merge(base, extra)));
  return container.firstElementChild;
}

describe("Generates Spacer Component", () => {
  test("creates with key as s-box", () => {
    const el = renderComponent();
    expect(el.tagName.toLowerCase()).toBe("s-box");
    expect(el.textContent).toBe("");
    // Default spacing is "base"
    expect(el.getAttribute("paddingInline")).toBe("base");
  });

  test("creates with translated spacing", () => {
    const el = renderComponent({
      item: {
        attributes: {
          spacing: "tight"
        }
      }
    });
    // tight → small after translation
    expect(el.getAttribute("paddingInline")).toBe("small");
  });
});