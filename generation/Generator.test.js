/**
 * @jest-environment jsdom
 */

import generate from "./Generator.jsx";
import { describe, expect, jest, test } from "@jest/globals";
import { render } from "@testing-library/preact";
import { isPresent } from "../utilities/present.js";

const badgeItem = { type: "s-badge", attributes: {}, text: "12" };
const boxItem = { type: "s-box", attributes: {}, text: "Box Text" };
const buttonItem = { type: "s-button", attributes: { href: "https://www.google.com" }, text: "Clickme" };
const buttonOptions = { loading: false, nextOffer: () => null };
const clickableItem = { type: "s-clickable", attributes: {}, text: "Clickable Text" };
const gridItem = { type: "s-grid", attributes: {}, text: "Grid Text" };
const headingItem = { type: "s-heading", attributes: {}, text: "Title!" };
const iconItem = { type: "s-icon", attributes: { source: "arrowDown" } };
const imageItem = { type: "s-image", attributes: { src: "https://www.image.com/something.jpg" } };
const linkItem = { type: "s-link", attributes: { href: "https://www.google.com" }, text: "Goto" };
const paragraphItem = { type: "s-paragraph", attributes: {}, text: "Paragraph Text" };
const spacerItem = { type: "s-spacer", attributes: {} };
const textItem = { type: "s-text", attributes: {}, text: "Custom" };

const eachItem = [
  { item: badgeItem, tagName: "s-badge" },
  { item: boxItem, tagName: "s-box" },
  { item: buttonItem, tagName: "s-button", options: { "s-button": buttonOptions } },
  { item: clickableItem, tagName: "s-clickable" },
  { item: gridItem, tagName: "s-grid" },
  { item: headingItem, tagName: "s-heading" },
  { item: iconItem, tagName: "s-icon" },
  { item: imageItem, tagName: "s-image" },
  { item: linkItem, tagName: "s-link" },
  { item: paragraphItem, tagName: "s-paragraph" },
  { item: spacerItem, tagName: "s-spacer" },
  { item: textItem, tagName: "s-text" },
];

function renderGenerated(items, options) {
  const generatedComponents = generate({ defaultKeyName: "test", items, level: 1, options });
  const { container } = render(generatedComponents);
  return container;
}

describe("Generator", () => {
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

  test("when type has no s- prefix it gets prepended", () => {
    const container = renderGenerated([{ type: "banner", text: "Alert!" }]);
    const el = container.querySelector("s-banner");
    expect(el).not.toBeNull();
    expect(el.textContent).toBe("Alert!");
  });

  test("prepends s- to standard types without prefix", () => {
    const items = [
      { type: "box", children: [{ type: "text", text: "Hello" }] },
      { type: "button", text: "Click", attributes: { href: "https://example.com" } },
      { type: "grid", children: [{ type: "heading", text: "Title" }] },
    ];
    const container = renderGenerated(items);
    expect(container.querySelector("s-box")).not.toBeNull();
    expect(container.querySelector("s-text").textContent).toBe("Hello");
    expect(container.querySelector("s-button").textContent).toBe("Click");
    expect(container.querySelector("s-grid")).not.toBeNull();
    expect(container.querySelector("s-heading").textContent).toBe("Title");
  });

  test("creates element with child elements", () => {
    const parent = {
      type: "s-box",
      attributes: {},
      text: "",
      children: [badgeItem],
    };

    const container = renderGenerated([parent], {});
    const box = container.querySelector("s-box");
    expect(box).not.toBeNull();
    const childBadge = box.querySelector("s-badge");
    expect(childBadge).not.toBeNull();
    expect(childBadge.textContent).toBe(badgeItem.text);
  });

  test("renders a nested v2 offer structure", () => {
    const items = [{
      type: "s-box",
      attributes: { border: "base" },
      children: [
        {
          type: "s-grid",
          name: "header",
          attributes: { padding: "large" },
          children: [{ type: "s-heading", text: "Your order is confirmed" }],
        },
        {
          type: "s-box",
          name: "offer",
          children: [
            { type: "s-paragraph", text: "Special offer" },
            {
              type: "s-grid",
              name: "actions",
              children: [
                { type: "s-button", text: "Claim offer", attributes: { variant: "primary", href: "https://uptick.com" } },
                { type: "s-link", children: [{ type: "s-text", text: "No, thanks" }] },
              ],
            },
          ],
        },
      ],
    }];

    const container = renderGenerated(items);
    expect(container.querySelector("s-box")).not.toBeNull();
    expect(container.querySelector("s-heading").textContent).toBe("Your order is confirmed");
    expect(container.querySelector("s-paragraph").textContent).toBe("Special offer");
    expect(container.querySelector("s-button").textContent).toBe("Claim offer");
    expect(container.querySelector("s-button").getAttribute("variant")).toBe("primary");
    expect(container.querySelector("s-link s-text").textContent).toBe("No, thanks");
  });

  test("assigns unique keys using name when present", () => {
    const items = [
      { type: "s-box", name: "header", children: [{ type: "s-text", text: "Hi" }] },
      { type: "s-box", name: "footer", children: [{ type: "s-text", text: "Bye" }] },
    ];
    const result = generate({ defaultKeyName: "test", items, logWarn: false });
    expect(result.props.children[0].key).toContain("header");
    expect(result.props.children[1].key).toContain("footer");
  });

  test("assigns key using defaultKeyName when name is absent", () => {
    const items = [{ type: "s-text", text: "Hello" }];
    const result = generate({ defaultKeyName: "mykey", items, logWarn: false });
    const vnode = result.props.children[0];
    expect(vnode.key).toBe("s-text-mykey-10");
  });

  test("key format includes type, name, and index", () => {
    const items = [
      { type: "s-box", name: "first", text: "A" },
      { type: "s-text", name: "second", text: "B" },
    ];
    const result = generate({ defaultKeyName: "test", items, logWarn: false });
    expect(result.props.children[0].key).toBe("s-box-first-10");
    expect(result.props.children[1].key).toBe("s-text-second-11");
  });

  test("renders correct number of attributes on element", () => {
    const container = renderGenerated([{
      type: "s-button",
      text: "Go",
      attributes: { href: "https://example.com", variant: "primary", accessibilityLabel: "Go button" },
    }]);
    const btn = container.querySelector("s-button");
    expect(btn.attributes.length).toBe(3);
    expect(btn.getAttribute("href")).toBe("https://example.com");
    expect(btn.getAttribute("variant")).toBe("primary");
    expect(btn.getAttribute("accessibilityLabel")).toBe("Go button");
  });

  test("uses top-level url as nextOffer click target", () => {
    const nextOffer = jest.fn();
    const container = renderGenerated([{
      type: "s-link",
      name: "button-reject",
      url: "https://example.com/reject",
      children: [{ type: "s-paragraph", text: "No, thanks" }],
    }], {
      link: { loading: false, nextOffer }
    });
    const link = container.querySelector("s-link");
    link.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(nextOffer).toHaveBeenCalledWith("https://example.com/reject");
  });

  test("normalizes type options for s-prefixed action types", () => {
    const nextOffer = jest.fn();
    const container = renderGenerated([{
      type: "s-button",
      text: "Reject",
      url: "https://example.com/reject",
    }], {
      button: { loading: false, nextOffer }
    });
    const button = container.querySelector("s-button");
    button.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(nextOffer).toHaveBeenCalledWith("https://example.com/reject");
  });

  test("does not render loading or nextOffer as attributes", () => {
    const container = renderGenerated([{
      type: "s-button",
      text: "Reject",
      url: "https://example.com/reject",
      attributes: { variant: "secondary" },
    }], {
      button: { loading: false, nextOffer: jest.fn() }
    });
    const button = container.querySelector("s-button");
    expect(button.getAttribute("variant")).toBe("secondary");
    expect(button.hasAttribute("nextOffer")).toBe(false);
    expect(button.hasAttribute("loading")).toBe(false);
  });

  test("element with no attributes has zero attributes", () => {
    const container = renderGenerated([{ type: "s-text", text: "Plain" }]);
    const el = container.querySelector("s-text");
    expect(el.attributes.length).toBe(0);
  });

  test("passes attributes through to the element", () => {
    const container = renderGenerated([{
      type: "s-box",
      text: "Padded",
      attributes: { padding: "base", border: "dashed" },
    }]);
    const box = container.querySelector("s-box");
    expect(box.getAttribute("padding")).toBe("base");
    expect(box.getAttribute("border")).toBe("dashed");
  });

  test("returns false for null items", () => {
    expect(generate({ defaultKeyName: "test", items: null, logWarn: false })).toBe(false);
  });
});
