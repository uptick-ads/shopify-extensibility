/**
 * @jest-environment jsdom
 */

import generatePressable from "./Pressable.jsx";
import {describe, expect, test} from "@jest/globals";
import { render } from "@testing-library/preact";
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

function renderComponent(data, extra = {}) {
  const { container } = render(generatePressable(merge(data, extra)));
  return container.firstElementChild;
}

describe("Generates Pressable Component with no to or url", () => {
  test("creates with key and text", () => {
    const vnode = generatePressable(merge(plainPressable, {}));
    expect(vnode.key).toBe("pressable-test-1");

    const el = renderComponent(plainPressable);
    expect(el.tagName.toLowerCase()).toBe("s-clickable");
    expect(el.textContent).toBe("Plain");
    expect(el.attributes.length).toBe(0);
  });

  test("creates with custom property", () => {
    const el = renderComponent(plainPressable, {
      item: {
        attributes: {
          emphasis: "bold"
        }
      }
    });
    expect(el.getAttribute("emphasis")).toBe("bold");
  });

  test("creates with children if text is blank", () => {
    const el = renderComponent(plainPressable, {
      item: {
        text: ""
      },
      children: "Children"
    });
    expect(el.textContent).toBe("Children");
  });
});

describe("Generates Pressable Component with to attribute", () => {
  test("creates with key and text", () => {
    const vnode = generatePressable(merge(toAttributePressable, {}));
    expect(vnode.key).toBe("pressable-test-1");

    const el = renderComponent(toAttributePressable);
    expect(el.tagName.toLowerCase()).toBe("s-clickable");
    expect(el.textContent).toBe("To Attribute");
    // to → href after translation
    expect(el.getAttribute("href")).toBe("https://google.com");
    expect(el.attributes.length).toBe(1);
  });

  test("creates with custom property", () => {
    const el = renderComponent(toAttributePressable, {
      item: {
        attributes: {
          emphasis: "bold"
        }
      }
    });
    expect(el.getAttribute("emphasis")).toBe("bold");
    expect(el.getAttribute("href")).toBe("https://google.com");
  });

  test("creates with children if text is blank", () => {
    const el = renderComponent(toAttributePressable, {
      item: {
        text: ""
      },
      children: "Children"
    });
    expect(el.textContent).toBe("Children");
  });
});

describe("Generates Pressable Component with url property", () => {
  test("creates with key and text", () => {
    const vnode = generatePressable(merge(urlPropertyPressable, {}));
    expect(vnode.key).toBe("pressable-test-1");

    const el = renderComponent(urlPropertyPressable);
    expect(el.tagName.toLowerCase()).toBe("s-clickable");
    expect(el.textContent).toBe("Url Property");
    // url pressables get onClick handler, no href attribute
    expect(el.getAttribute("href")).toBeNull();
    expect(el.attributes.length).toBe(0);
  });

  test("creates with custom property", () => {
    const el = renderComponent(urlPropertyPressable, {
      item: {
        attributes: {
          emphasis: "bold"
        }
      }
    });
    expect(el.getAttribute("emphasis")).toBe("bold");
  });

  test("creates with children if text is blank", () => {
    const el = renderComponent(urlPropertyPressable, {
      item: {
        text: ""
      },
      children: "Children"
    });
    expect(el.textContent).toBe("Children");
  });
});
