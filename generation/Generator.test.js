/**
 * @jest-environment jsdom
 */

import generate from "./Generator.jsx";
import {describe, expect, test} from "@jest/globals";
import { render } from "@testing-library/preact";
import merge from "deepmerge";
import { isPresent } from "../utilities/present.js";

const badgeItem = {
  type: "badge",
  attributes: {
  },
  text: "12"
};

const blockLayoutItem = {
  type: "block_layout",
  attributes: {
  },
  text: "Block Text"
};

const buttonItem = {
  type: "button",
  attributes: {
    to: "https://www.google.com"
  },
  text: "Clickme"
};

const buttonOptions = {
  loading: false,
  nextOffer: () => null
};

const gridItem = {
  type: "grid",
  attributes: {
  },
  text: "Grid Text"
};

const headingItem = {
  type: "heading",
  attributes: {
  },
  text: "Title!"
};

const iconItem = {
  type: "icon",
  attributes: {
    source: "arrowDown"
  }
};

const imageItem = {
  type: "image",
  attributes: {
    source: "https://www.image.com/something.jpg"
  }
};

const inlineLayoutItem = {
  type: "inline_layout",
  attributes: {
  },
  text: "Inline Text"
};

const linkItem = {
  type: "link",
  attributes: {
    to: "https://www.google.com"
  },
  text: "Goto"
};

const newlineItem = {
  type: "newline",
  attributes: {
  }
};

const pressableItem = {
  type: "pressable",
  attributes: {
  },
  text: "Pressable Text"
};

const spacerItem = {
  type: "spacer",
  attributes: {
  }
};

const textItem = {
  type: "text",
  attributes: {
  },
  text: "Custom"
};

const viewItem = {
  type: "view",
  attributes: {
  },
  text: "View Text"
};

const eachItem = [
  { item: badgeItem, tagName: "s-badge" },
  { item: blockLayoutItem, tagName: "s-grid" },
  { item: buttonItem, tagName: "s-button", options: { button: buttonOptions } },
  { item: gridItem, tagName: "s-grid" },
  { item: headingItem, tagName: "s-heading" },
  { item: iconItem, tagName: "s-icon" },
  { item: imageItem, tagName: "s-image" },
  { item: inlineLayoutItem, tagName: "s-grid" },
  { item: linkItem, tagName: "s-link" },
  { item: newlineItem, tagName: "s-box" },
  { item: pressableItem, tagName: "s-clickable" },
  { item: spacerItem, tagName: "s-box" },
  { item: textItem, tagName: "s-paragraph" },
  { item: viewItem, tagName: "s-box" }
];

function renderGenerated(items, options) {
  const generatedComponents = generate({ defaultKeyName: "test", items: items, level: 1, options: options });
  const { container } = render(generatedComponents);
  return container;
}

describe("Generation Tests", () => {
  eachItem.forEach((detail) => {
    test(`creates ${detail.item.type} component`, () => {
      const container = renderGenerated([detail.item], detail.options);
      const el = container.querySelector(detail.tagName);
      expect(el).not.toBeNull();
      if (isPresent(detail.item.text)) {
        expect(el.textContent).toBe(detail.item.text);
      } else {
        expect(el.textContent).toBe("");
      }
    });

    test(`creates 3 components of ${detail.item.type}`, () => {
      const container = renderGenerated([detail.item, detail.item, detail.item], detail.options);
      const elements = container.querySelectorAll(detail.tagName);
      expect(elements.length).toBe(3);
    });
  });

  test("when items is empty returns false", () => {
    expect(generate({ defaultKeyName: "test", items: [] })).toBe(false);
  });

  test("when defaultKeyName is empty returns false", () => {
    expect(generate({ defaultKeyName: "", items: [textItem], logWarn: false })).toBe(false);
  });

  test("when type is unknown returns false", () => {
    const copy = merge(textItem, { type: "crazy" });
    expect(generate({ defaultKeyName: "test", items: [copy], logWarn: false })).toBe(false);
  });

  eachItem.filter((detail) => ["badge", "block_layout", "button", "grid", "heading", "inline_layout", "link", "pressable", "text", "view"].includes(detail.item.type)).forEach((detail) => {
    test(`when ${detail.item.type} text and children is empty returns false`, () => {
      const copy = merge(detail.item, { text: "" });
      expect(generate({ defaultKeyName: "test", items: [copy], logWarn: false, options: detail.options })).toBe(false);
    });
  });

  eachItem.filter((detail) => ["badge", "block_layout", "button", "grid", "heading", "inline_layout", "link", "pressable", "text", "view"].includes(detail.item.type)).forEach((detail) => {
    test(`when ${detail.item.type} text and children is empty returns false`, () => {
      const copy = merge(detail.item, { text: "" });
      expect(generate({ defaultKeyName: "test", items: [copy], logWarn: false, options: detail.options, allowEmpty: true })).not.toBe(false);
    });
  });

  test("creates text with child badge", () => {
    const parent = {
      ...textItem,
      text: "",
      children: [
        badgeItem
      ]
    };

    const container = renderGenerated([parent]);
    const textEl = container.querySelector("s-paragraph");
    expect(textEl).not.toBeNull();

    const childBadge = textEl.querySelector("s-badge");
    expect(childBadge).not.toBeNull();
    expect(childBadge.textContent).toBe(badgeItem.text);
  });
});