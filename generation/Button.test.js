/**
 * @jest-environment jsdom
 */

// Have to generate this test different because of error.
// See https://github.com/Shopify/ui-extensions/issues/712
import generateButton, { createDynamicAttributes } from "./Button.jsx";
import {describe, expect, test} from "@jest/globals";
import { mount } from "@remote-ui/testing";
import { createRoot } from "@remote-ui/react";
import { Element } from "@shopify/react-testing";
import "@shopify/react-testing/matchers";
import { Button } from "@shopify/ui-extensions/checkout";
import merge from "deepmerge";

const plainButton = {
  defaultKeyName: "test",
  keyIndex: 1,
  item: {
    attributes: {
    },
    text: "Plain"
  }
};

const toAttributeButton = {
  defaultKeyName: "test",
  keyIndex: 1,
  item: {
    attributes: {
      to: "https://google.com"
    },
    text: "To Attribute"
  },
  options: {
    rejected: false,
    rejectOffer: (url) => url
  }
};

const urlPropertyButton = {
  defaultKeyName: "test",
  keyIndex: 1,
  item: {
    attributes: {
    },
    url: "https://google.com",
    text: "Url Property"
  },
  options: {
    rejected: false,
    rejectOffer: (url) => url
  }
};

function mountWithRoot(data, extra = {}) {
  const generatedComponent = generateButton(merge(data, extra));
  const root = mount((root) => {
    return createRoot(root).render(generatedComponent);
  });
  const rawComponent = root.find(Button);
  return new Element(rawComponent, rawComponent.children, root);
}

describe("Generates Button Component with no to or url", () => {
  test("creates with key and text", () => {
    const component = mountWithRoot(plainButton);
    expect(component.is(Button)).toBeTruthy();
    expect(component.text()).toBe("Plain");
    // This isn't working since I had to hack it together with root mount
    // expect(component.tree.key).toBe("button-test-1");
    expect(Object.keys(component.props).length).toBe(0);
  });

  test("creates component with html spaces", () => {
    const component = mountWithRoot(plainButton, { item: { text: "\u00A0\u00A0\u00A0Plain\u00A0\u00A0\u00A0"} });
    expect(component.is(Button)).toBeTruthy();
    // It's not showing html in the test framework, but works on the page. Best I can test
    expect(component.text()).toBe("\u00A0\u00A0\u00A0Plain\u00A0\u00A0\u00A0");

    // This isn't working since I had to hack it together with root mount
    // expect(component.tree.key).toBe("button-test-1");
    expect(Object.keys(component.props).length).toBe(0);
  });

  test("creates with custom property", () => {
    const component = mountWithRoot(plainButton, {
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
    const component = mountWithRoot(plainButton, {
      item: {
        text: ""
      },
      children: "Children"
    });
    expect(component.text()).toBe("Children");
    expect(Object.keys(component.props).length).toBe(0);
  });
});

describe("Generates Button Component with to attribute", () => {
  test("creates with key and text", () => {
    const component = mountWithRoot(toAttributeButton);
    expect(component.is(Button)).toBeTruthy();
    expect(component.text()).toBe("To Attribute");
    expect(component.prop("disabled")).toBe(false);
    expect(component.prop("loading")).toBe(false);
    expect(component.prop("to")).toBe("https://google.com");
    // This isn't working since I had to hack it together with root mount
    // expect(component.tree.key).toBe("button-test-1");
    expect(Object.keys(component.props).length).toBe(3);
  });

  test("creates with custom property", () => {
    const component = mountWithRoot(toAttributeButton, {
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
    const component = mountWithRoot(toAttributeButton, {
      item: {
        text: ""
      },
      children: "Children"
    });
    expect(component.text()).toBe("Children");
    expect(Object.keys(component.props).length).toBe(3);
  });
});

describe("Generates Button Component with url property", () => {
  test("creates with key and text", () => {
    const component = mountWithRoot(urlPropertyButton);
    expect(component.is(Button)).toBeTruthy();
    expect(component.text()).toBe("Url Property");
    expect(component.prop("disabled")).toBe(false);
    expect(component.prop("loading")).toBe(false);
    expect(component.props).toHaveProperty("onPress", expect.any(Function));
    // This isn't working since I had to hack it together with root mount
    // expect(component.tree.key).toBe("button-test-1");
    expect(Object.keys(component.props).length).toBe(3);
  });

  test("creates with custom property", () => {
    const component = mountWithRoot(urlPropertyButton, {
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
    const component = mountWithRoot(urlPropertyButton, {
      item: {
        text: ""
      },
      children: "Children"
    });
    expect(component.text()).toBe("Children");
    expect(Object.keys(component.props).length).toBe(3);
  });
});

describe("createDynamicAttributes", () => {
  test("add all properties if url blank", () => {
    const result = createDynamicAttributes({ url: "", attributes: { other: true } }, "rejected", "rejectOffer");
    expect(result).toStrictEqual({
      other: true,
      disabled: "rejected",
      loading: "rejected"
    });
  });

  test("add all properties if url is present", () => {
    const result = createDynamicAttributes({ url: "https://google.com", attributes: { other: true } }, "rejected", (url) => `clicked ${url}`);
    expect(result).toMatchObject({
      other: true,
      disabled: "rejected",
      loading: "rejected"
    });
    expect(result.onPress()).toBe("clicked https://google.com");
  });
});