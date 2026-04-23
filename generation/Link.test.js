/**
 * @jest-environment jsdom
 */

import generateLink from "./Link.jsx";
import {describe, expect, test} from "@jest/globals";
import { render } from "@testing-library/preact";
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
    loading: false,
    nextOffer: (url) => url
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
    loading: false,
    nextOffer: (url) => url
  }
};

function renderComponent(data, extra = {}) {
  const { container } = render(generateLink(merge(data, extra)));
  return container.firstElementChild;
}

describe("Generates Link Component", () => {
  test("creates with key and text", () => {
    const vnode = generateLink(merge(plainLink, {}));
    expect(vnode.key).toBe("link-test-1");

    const el = renderComponent(plainLink);
    expect(el.tagName.toLowerCase()).toBe("s-link");
    expect(el.textContent).toBe("Plain");
    // to → href after translation
    expect(el.getAttribute("href")).toBe("https://google.com");
    expect(el.attributes.length).toBe(1);
  });

  test("creates with custom property", () => {
    const el = renderComponent(plainLink, {
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
    const el = renderComponent(plainLink, {
      item: {
        text: ""
      },
      children: "Children"
    });
    expect(el.textContent).toBe("Children");
  });
});

describe("Generates Link Component with to attribute and options", () => {
  test("creates with key and text", () => {
    const vnode = generateLink(merge(toAttributeLink, {}));
    expect(vnode.key).toBe("link-test-1");

    const el = renderComponent(toAttributeLink);
    expect(el.tagName.toLowerCase()).toBe("s-link");
    expect(el.textContent).toBe("To Attribute");
    // to → href after translation
    expect(el.getAttribute("href")).toBe("https://google.com");
    expect(el.attributes.length).toBe(1);
  });

  test("creates with custom property", () => {
    const el = renderComponent(toAttributeLink, {
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
    const el = renderComponent(toAttributeLink, {
      item: {
        text: ""
      },
      children: "Children"
    });
    expect(el.textContent).toBe("Children");
  });
});

describe("Generates Link Component with url property and options", () => {
  test("creates with key and text", () => {
    const vnode = generateLink(merge(urlPropertyLink, {}));
    expect(vnode.key).toBe("link-test-1");

    const el = renderComponent(urlPropertyLink);
    expect(el.tagName.toLowerCase()).toBe("s-link");
    expect(el.textContent).toBe("Url Property");
    // url buttons get onClick handler, no href attribute
    expect(el.getAttribute("href")).toBeNull();
    expect(el.attributes.length).toBe(0);
  });

  test("creates with custom property", () => {
    const el = renderComponent(urlPropertyLink, {
      item: {
        attributes: {
          emphasis: "bold"
        }
      }
    });
    expect(el.getAttribute("emphasis")).toBe("bold");
  });

  test("creates with children if text is blank", () => {
    const el = renderComponent(urlPropertyLink, {
      item: {
        text: ""
      },
      children: "Children"
    });
    expect(el.textContent).toBe("Children");
  });
});