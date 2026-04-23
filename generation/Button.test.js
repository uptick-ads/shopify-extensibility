/**
 * @jest-environment jsdom
 */

import generateButton, { createDynamicAttributes } from "./Button.jsx";
import {describe, expect, test, jest} from "@jest/globals";
import { render } from "@testing-library/preact";
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
    loading: false,
    nextOffer: (url) => url
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
    loading: false,
    nextOffer: (url) => url
  }
};

function renderComponent(data, extra = {}) {
  const { container } = render(generateButton(merge(data, extra)));
  return container.firstElementChild;
}

describe("Generates Button Component with no to or url", () => {
  test("creates with key and text", () => {
    const vnode = generateButton(merge(plainButton, {}));
    expect(vnode.key).toBe("button-test-1");

    const el = renderComponent(plainButton);
    expect(el.tagName.toLowerCase()).toBe("s-button");
    expect(el.textContent).toBe("Plain");
    expect(el.attributes.length).toBe(0);
  });

  test("creates component with html spaces", () => {
    const el = renderComponent(plainButton, { item: { text: "\u00A0\u00A0\u00A0Plain\u00A0\u00A0\u00A0"} });
    expect(el.tagName.toLowerCase()).toBe("s-button");
    expect(el.textContent).toContain("Plain");
  });

  test("creates with custom property", () => {
    const el = renderComponent(plainButton, {
      item: {
        attributes: {
          emphasis: "bold"
        }
      }
    });
    expect(el.getAttribute("emphasis")).toBe("bold");
  });

  test("creates with children if text is blank", () => {
    const el = renderComponent(plainButton, {
      item: {
        text: ""
      },
      children: "Children"
    });
    expect(el.textContent).toBe("Children");
  });
});

describe("Generates Button Component with to attribute", () => {
  test("creates with key and text", () => {
    const vnode = generateButton(merge(toAttributeButton, {}));
    expect(vnode.key).toBe("button-test-1");

    const el = renderComponent(toAttributeButton);
    expect(el.tagName.toLowerCase()).toBe("s-button");
    expect(el.textContent).toBe("To Attribute");
    // to → href after translation
    expect(el.getAttribute("href")).toBe("https://google.com");
    expect(el.attributes.length).toBe(1);
  });

  test("creates with custom property", () => {
    const el = renderComponent(toAttributeButton, {
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
    const el = renderComponent(toAttributeButton, {
      item: {
        text: ""
      },
      children: "Children"
    });
    expect(el.textContent).toBe("Children");
  });
});

describe("Generates Button Component with url property", () => {
  test("creates with key and text", () => {
    const vnode = generateButton(merge(urlPropertyButton, {}));
    expect(vnode.key).toBe("button-test-1");

    const el = renderComponent(urlPropertyButton);
    expect(el.tagName.toLowerCase()).toBe("s-button");
    expect(el.textContent).toBe("Url Property");
    // url buttons get onClick handler, no href attribute
    expect(el.getAttribute("href")).toBeNull();
    expect(el.attributes.length).toBe(0);
  });

  test("creates with custom property", () => {
    const el = renderComponent(urlPropertyButton, {
      item: {
        attributes: {
          emphasis: "bold"
        }
      }
    });
    expect(el.getAttribute("emphasis")).toBe("bold");
  });

  test("creates with children if text is blank", () => {
    const el = renderComponent(urlPropertyButton, {
      item: {
        text: ""
      },
      children: "Children"
    });
    expect(el.textContent).toBe("Children");
  });
});

describe("createDynamicAttributes", () => {
  test("creates disabled and loading for to attribute", () => {
    const attrs = createDynamicAttributes({ attributes: { to: "url" } }, false, null);
    expect(attrs.disabled).toBe(false);
    expect(attrs.loading).toBe(false);
    expect(attrs.to).toBe("url");
  });

  test("creates onClick for url property", () => {
    const nextOffer = jest.fn();
    const attrs = createDynamicAttributes({ attributes: {}, url: "url" }, false, nextOffer);
    expect(attrs.disabled).toBe(false);
    expect(attrs.loading).toBe(false);
    expect(attrs.onClick).toBeInstanceOf(Function);
    attrs.onClick();
    expect(nextOffer).toHaveBeenCalledWith("url");
  });
});