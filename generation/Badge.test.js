/**
 * @jest-environment jsdom
 */

// Have to generate this test different because of error.
// See https://github.com/Shopify/ui-extensions/issues/712
import generateBadge from "./Badge.jsx";
import {describe, expect, test} from "@jest/globals";
import { mount } from "@remote-ui/testing";
import { createRoot } from "@remote-ui/react";
import { Element } from "@shopify/react-testing";
import "@shopify/react-testing/matchers";
import { Badge } from "@shopify/ui-extensions/checkout";
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

function mountWithRoot(extra = {}) {
  const generatedComponent = generateBadge(merge(base, extra));
  const root = mount((root) => {
    return createRoot(root).render(generatedComponent);
  });
  const rawComponent = root.find(Badge);
  return new Element(rawComponent, rawComponent.children, root);
}

describe("Generates Badge Component", () => {
  test("creates with key and text", () => {
    const component = mountWithRoot();
    expect(component.is(Badge)).toBeTruthy();
    expect(component.text()).toBe("11");
    // This isn't working since I had to hack it together
    // expect(component.tree.key).toBe("badge-test-1");
    expect(component.prop("size")).toBe("small");
    expect(Object.keys(component.props).length).toBe(1);
  });

  test("creates with children if text is blank", () => {
    const component = mountWithRoot({
      item: {
        text: ""
      },
      children: "Children"
    });
    expect(component.text()).toBe("Children");
    expect(Object.keys(component.props).length).toBe(1);
  });
});
