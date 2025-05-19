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

const plainLink = {
  defaultKeyName: "test",
  keyIndex: 1,
  item: {
    attributes: {
      to: "https://google.com"
    },
    text: "Plain"
  }
};

const toAttributeLink = {
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

const urlPropertyLink = {
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
  const generatedComponent = generateLink(merge(data, extra));
  const root = mount((root) => {
    return createRoot(root).render(generatedComponent);
  });
  const rawComponent = root.find(Link);
  return new Element(rawComponent, rawComponent.children, root);
}

describe("Generates Link Component", () => {
  test("creates with key and text", () => {
    const component = mountWithRoot(plainLink);
    expect(component.is(Link)).toBeTruthy();
    expect(component.text()).toBe("Plain");
    // This isn't working since I had to hack it together
    // expect(component.tree.key).toBe("link-test-1");
    expect(component.prop("to")).toBe("https://google.com");
    expect(Object.keys(component.props).length).toBe(1);
  });

  test("creates with custom property", () => {
    const component = mountWithRoot(plainLink, {
      item: {
        attributes: {
          emphasis: "bold"
        }
      }
    });
    expect(component.prop("emphasis")).toBe("bold");
    expect(component.prop("to")).toBe("https://google.com");
    expect(Object.keys(component.props).length).toBe(2);
  });

  test("creates with children if text is blank", () => {
    const component = mountWithRoot(plainLink, {
      item: {
        text: ""
      },
      children: "Children"
    });
    expect(component.text()).toBe("Children");
    expect(Object.keys(component.props).length).toBe(1);
  });
});

describe("Generates Link Component with to attribute and options", () => {
  test("creates with key and text", () => {
    const component = mountWithRoot(toAttributeLink);
    expect(component.is(Link)).toBeTruthy();
    expect(component.text()).toBe("To Attribute");
    expect(component.prop("disabled")).toBe(false);
    expect(component.prop("loading")).toBe(false);
    expect(component.prop("to")).toBe("https://google.com");
    // This isn't working since I had to hack it together with root mount
    // expect(component.tree.key).toBe("button-test-1");
    expect(Object.keys(component.props).length).toBe(3);
  });

  test("creates with custom property", () => {
    const component = mountWithRoot(toAttributeLink, {
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
    const component = mountWithRoot(toAttributeLink, {
      item: {
        text: ""
      },
      children: "Children"
    });
    expect(component.text()).toBe("Children");
    expect(Object.keys(component.props).length).toBe(3);
  });
});

describe("Generates Link Component with url property and options", () => {
  test("creates with key and text", () => {
    const component = mountWithRoot(urlPropertyLink);
    expect(component.is(Link)).toBeTruthy();
    expect(component.text()).toBe("Url Property");
    expect(component.prop("disabled")).toBe(false);
    expect(component.prop("loading")).toBe(false);
    expect(component.props).toHaveProperty("onPress", expect.any(Function));
    // This isn't working since I had to hack it together with root mount
    // expect(component.tree.key).toBe("button-test-1");
    expect(Object.keys(component.props).length).toBe(3);
  });

  test("creates with custom property", () => {
    const component = mountWithRoot(urlPropertyLink, {
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
    const component = mountWithRoot(urlPropertyLink, {
      item: {
        text: ""
      },
      children: "Children"
    });
    expect(component.text()).toBe("Children");
    expect(Object.keys(component.props).length).toBe(3);
  });
});