/**
 * @jest-environment jsdom
 */

// Have to generate this test different because of error.
// See https://github.com/Shopify/ui-extensions/issues/712
import generate from "./Generator.jsx";
import {describe, expect, test} from "@jest/globals";
import { mount } from "@remote-ui/testing";
import { createRoot } from "@remote-ui/react";
import { Element } from "@shopify/react-testing";
import "@shopify/react-testing/matchers";
import merge from "deepmerge";
import {
  Badge,
  BlockLayout,
  Button,
  Grid,
  Heading,
  Icon,
  Image,
  InlineLayout,
  Link,
  BlockSpacer, // newline
  InlineSpacer, // spacer
  Pressable,
  Text,
  View
} from "@shopify/ui-extensions/checkout";
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
  rejected: false,
  rejectOffer: () => null
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
  { item: badgeItem, component: Badge },
  { item: blockLayoutItem, component: BlockLayout },
  { item: buttonItem, component: Button, options: { button: buttonOptions }, extra_attributes: 2 },
  { item: gridItem, component: Grid },
  { item: headingItem, component: Heading },
  { item: iconItem, component: Icon },
  { item: imageItem, component: Image },
  { item: inlineLayoutItem, component: InlineLayout },
  { item: linkItem, component: Link },
  { item: newlineItem, component: BlockSpacer },
  { item: pressableItem, component: Pressable },
  { item: spacerItem, component: InlineSpacer },
  { item: textItem, component: Text },
  { item: viewItem, component: View }
];

function mountRoot(items, options) {
  const generatedComponents = generate({ defaultKeyName: "test", items: items, level: 1, options: options });
  return mount((root) => {
    return createRoot(root).render(generatedComponents);
  });
}

function createElement(root, type) {
  const rawComponent = root.find(type);
  return new Element(rawComponent, rawComponent.children, root);
}

describe("Generation Tests", () => {
  eachItem.forEach((detail) => {
    test(`creates ${detail.item.type} component`, () => {
      const root = mountRoot([detail.item], detail.options);
      const component = createElement(root, detail.component);
      expect(component.is(detail.component)).toBeTruthy();
      if (isPresent(detail.item.text)) {
        expect(component.text()).toBe(detail.item.text);
      } else {
        expect(component.text()).toBe("");
      }
      expect(Object.keys(component.props).length).toBe(Object.keys(detail.item.attributes).length + (detail.extra_attributes || 0));
    });

    test(`creates 3 components of ${detail.item.type}`, () => {
      const root = mountRoot([detail.item, detail.item, detail.item], detail.options);
      const components = root.findAll(detail.component);
      expect(components.length).toBe(3);
      components.forEach((rawComponent) => {
        const component = new Element(rawComponent, rawComponent.children, root);
        expect(component.is(detail.component)).toBeTruthy();
      });
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

  test("creates text with child text and link", () => {
    const parent = merge(textItem, {
      text: "",
      children: [
        badgeItem
      ]
    });

    const generatedComponents = generate({ defaultKeyName: "test", items: [parent] });
    const root = mount((root) => {
      return createRoot(root).render(generatedComponents);
    });
    const rawComponent = root.find(Text);

    const viewComponent = new Element(rawComponent, rawComponent.children, root);
    expect(viewComponent.is(Text)).toBeTruthy();

    const childText = viewComponent.find(Badge);
    expect(childText.is(Badge)).toBeTruthy();
    expect(childText.text).toBe(badgeItem.text);
  });
});