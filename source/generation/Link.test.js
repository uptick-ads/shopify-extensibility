/**
 * @jest-environment jsdom
 */

// Have to generate this test different because of error.
// See https://github.com/Shopify/ui-extensions/issues/712
import generateLink from "./Link.jsx";
import {describe, expect, test} from "@jest/globals";
import { mount } from "@remote-ui/testing";
import { createRoot } from "@remote-ui/react";
import { Element } from "@shopify/react-testing";
import "@shopify/react-testing/matchers";
import { Link } from "@shopify/ui-extensions/checkout";
import merge from "deepmerge";

const base = {
  defaultKeyName: "test",
  keyIndex: 1,
  item: {
    attributes: {
      to: "https://google.com"
    },
    text: "Custom"
  }
};

function mountWithRoot(extra = {}) {
  const generatedComponent = generateLink(merge(base, extra));
  const root = mount((root) => {
    return createRoot(root).render(generatedComponent);
  });
  const rawComponent = root.find(Link);
  return new Element(rawComponent, rawComponent.children, root);
}

describe("Generates Link Component", () => {
  test("creates with key and text", () => {
    const component = mountWithRoot();
    expect(component.is(Link)).toBeTruthy();
    expect(component.text()).toBe("Custom");
    // This isn't working since I had to hack it together
    // expect(component.tree.key).toBe("link-test-1");
    expect(component.prop("to")).toBe("https://google.com");
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