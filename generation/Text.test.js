/**
 * @jest-environment jsdom
 */

import generateText from "./Text.jsx";
import {describe, expect, test} from "@jest/globals";
import { mount } from "@shopify/react-testing";
import "@shopify/react-testing/matchers";
import { Text } from "@shopify/ui-extensions/checkout";
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

function mountMerge(extra = {}) {
  const generatedComponent = generateText(merge(base, extra));
  return mount(generatedComponent);
}

describe("Generates Text Component", () => {
  test("creates with key and text", () => {
    const component = mountMerge();
    expect(component.is(Text)).toBeTruthy();
    expect(component.text()).toBe("Custom");
    expect(component.tree.key).toBe("text-test-1");
    expect(Object.keys(component.props).length).toBe(1);
  });

  test("creates with custom property", () => {
    const component = mountMerge({
      item: {
        attributes: {
          emphasis: "bold"
        }
      }
    });
    expect(component.prop("emphasis")).toBe("bold");
    expect(Object.keys(component.props).length).toBe(2);
  });

  test("creates with children if text is blank", () => {
    const component = mountMerge({
      item: {
        text: ""
      },
      children: "Children"
    });
    expect(component.text()).toBe("Children");
    expect(Object.keys(component.props).length).toBe(1);
  });
});