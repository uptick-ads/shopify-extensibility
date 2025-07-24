/**
 * @jest-environment jsdom
 */

// Have to generate this test different because of error.
// See https://github.com/Shopify/ui-extensions/issues/712
import generatePressable from "./Pressable.jsx";
import {describe, expect, test} from "@jest/globals";
import { mount } from "@remote-ui/testing";
import { createRoot } from "@remote-ui/react";
import { Element } from "@shopify/react-testing";
import "@shopify/react-testing/matchers";
import { Pressable } from "@shopify/ui-extensions/checkout";
import merge from "deepmerge";

const plainPressable = {
  defaultKeyName: "test",
  keyIndex: 1,
  item: {
    attributes: {
    },
    text: "Plain"
  }
};

const toAttributePressable = {
  defaultKeyName: "test",
  keyIndex: 1,
  item: {
    attributes: {
      to: "https://google.com"
    },
    text: "To Attribute"
  },
  options: {
    loading: false,
    nextOffer: (url) => url
  }
};

const urlPropertyPressable = {
  defaultKeyName: "test",
  keyIndex: 1,
  item: {
    attributes: {
    },
    url: "https://google.com",
    text: "Url Property"
  },
  options: {
    loading: false,
    nextOffer: (url) => url
  }
};

function mountWithRoot(data, extra = {}) {
  const generatedComponent = generatePressable(merge(data, extra));
  const root = mount((root) => {
    return createRoot(root).render(generatedComponent);
  });
  const rawComponent = root.find(Pressable);
  return new Element(rawComponent, rawComponent.children, root);
}

describe("Generates Pressable Component with no to or url", () => {
  test("creates with key and text", () => {
    const component = mountWithRoot(plainPressable);
    expect(component.is(Pressable)).toBeTruthy();
    expect(component.text()).toBe("Plain");
    // This isn't working since I had to hack it together with root mount
    // expect(component.tree.key).toBe("pressable-test-1");
    expect(Object.keys(component.props).length).toBe(0);
  });

  test("creates with custom property", () => {
    const component = mountWithRoot(plainPressable, {
      item: {
        attributes: {
          emphasis: "bold"
        }
      }
    });
    expect(component.prop("emphasis")).toBe("bold");
    expect(Object.keys(component.props).length).toBe(1);
  });

  test("creates with children if text is blank", () => {
    const component = mountWithRoot(plainPressable, {
      item: {
        text: ""
      },
      children: "Children"
    });
    expect(component.text()).toBe("Children");
    expect(Object.keys(component.props).length).toBe(0);
  });
});

describe("Generates Pressable Component with to attribute", () => {
  test("creates with key and text", () => {
    const component = mountWithRoot(toAttributePressable);
    expect(component.is(Pressable)).toBeTruthy();
    expect(component.text()).toBe("To Attribute");
    expect(component.prop("disabled")).toBe(false);
    expect(component.prop("loading")).toBe(false);
    expect(component.prop("to")).toBe("https://google.com");
    // This isn't working since I had to hack it together with root mount
    // expect(component.tree.key).toBe("pressable-test-1");
    expect(Object.keys(component.props).length).toBe(3);
  });

  test("creates with custom property", () => {
    const component = mountWithRoot(toAttributePressable, {
      item: {
        attributes: {
          emphasis: "bold"
        }
      }
    });
    expect(component.prop("emphasis")).toBe("bold");
    expect(component.prop("disabled")).toBe(false);
    expect(component.prop("loading")).toBe(false);
    expect(Object.keys(component.props).length).toBe(4);
  });

  test("creates with children if text is blank", () => {
    const component = mountWithRoot(toAttributePressable, {
      item: {
        text: ""
      },
      children: "Children"
    });
    expect(component.text()).toBe("Children");
    expect(Object.keys(component.props).length).toBe(3);
  });
});

describe("Generates Pressable Component with url property", () => {
  test("creates with key and text", () => {
    const component = mountWithRoot(urlPropertyPressable);
    expect(component.is(Pressable)).toBeTruthy();
    expect(component.text()).toBe("Url Property");
    expect(component.prop("disabled")).toBe(false);
    expect(component.prop("loading")).toBe(false);
    expect(component.props).toHaveProperty("onPress", expect.any(Function));
    // This isn't working since I had to hack it together with root mount
    // expect(component.tree.key).toBe("pressable-test-1");
    expect(Object.keys(component.props).length).toBe(3);
  });

  test("creates with custom property", () => {
    const component = mountWithRoot(urlPropertyPressable, {
      item: {
        attributes: {
          emphasis: "bold"
        }
      }
    });
    expect(component.prop("emphasis")).toBe("bold");
    expect(component.prop("disabled")).toBe(false);
    expect(component.prop("loading")).toBe(false);
    expect(Object.keys(component.props).length).toBe(4);
  });

  test("creates with children if text is blank", () => {
    const component = mountWithRoot(urlPropertyPressable, {
      item: {
        text: ""
      },
      children: "Children"
    });
    expect(component.text()).toBe("Children");
    expect(Object.keys(component.props).length).toBe(3);
  });
});
