/**
 * @jest-environment jsdom
 */

import generateNewLine from "./NewLine.jsx";
import {describe, expect, test} from "@jest/globals";
import { mount } from "@shopify/react-testing";
import "@shopify/react-testing/matchers";
import { BlockSpacer } from "@shopify/ui-extensions/checkout";
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
  const generatedComponent = generateNewLine(merge(base, extra));
  return mount(generatedComponent);
}

describe("Generates NewLine Component", () => {
  test("creates with key", () => {
    const component = mountMerge();
    expect(component.is(BlockSpacer)).toBeTruthy();
    expect(component.text()).toBe("");
    expect(component.tree.key).toBe("newline-test-1");
    expect(Object.keys(component.props).length).toBe(0);
  });

  test("creates with custom property", () => {
    const component = mountMerge({
      item: {
        attributes: {
          spacing: "tight"
        }
      }
    });
    expect(component.prop("spacing")).toBe("tight");
    expect(Object.keys(component.props).length).toBe(1);
  });
});