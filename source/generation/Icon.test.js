/**
 * @jest-environment jsdom
 */

// Have to generate this test different because of error.
// See https://github.com/Shopify/ui-extensions/issues/712
import generateIcon from "./Icon.jsx";
import {describe, expect, test} from "@jest/globals";
import { mount } from "@remote-ui/testing";
import { createRoot } from "@remote-ui/react";
import { Element } from "@shopify/react-testing";
import "@shopify/react-testing/matchers";
import { Icon } from "@shopify/ui-extensions/checkout";
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

function mountWithRoot(extra = {}) {
  const generatedComponent = generateIcon(merge(base, extra));
  const root = mount((root) => {
    return createRoot(root).render(generatedComponent);
  });
  const rawComponent = root.find(Icon);
  return new Element(rawComponent, rawComponent.children, root);
}

describe("Generates Icon Component", () => {
  test("creates with key and text", () => {
    const component = mountWithRoot();
    expect(component.is(Icon)).toBeTruthy();
    expect(component.text()).toBe("");
    // This isn't working since I had to hack it together
    // expect(component.tree.key).toBe("icon-test-1");
    expect(component.prop("source")).toBe("arrowDown");
    expect(Object.keys(component.props).length).toBe(1);
  });
});
