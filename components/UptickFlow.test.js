/**
 * @jest-environment jsdom
 */

import {
  describe,
  expect,
  test,
  jest,
  beforeEach
} from "@jest/globals";
import { render } from "@testing-library/preact";
import UptickOffer, { addURLtoOffer } from "./UptickFlow.jsx";

const sampleData = {
  type: "offer",
  id: "1",
  children: [
    {
      type: "s-box",
      children: [
        {
          type: "s-grid",
          children: [
            {
              type: "s-text",
              text: "Welcome to Uptick!"
            },
            {
              type: "s-box",
              children: [
                {
                  type: "s-button",
                  text: "Claim your $20",
                  name: "button-accept",
                  attributes: {
                    href: "https://app.uptick.com/accept"
                  }
                },
                {
                  type: "s-link",
                  name: "button-reject",
                  text: "Forfeit your $20",
                  url: "https://app.uptick.com/reject"
                }
              ]
            }
          ]
        }
      ]
    }
  ],
  links: {
    next_offer: "https://example.com/next_offer"
  }
};

function cloneOffer() {
  return JSON.parse(JSON.stringify(sampleData));
}

describe("addURLtoOffer", () => {
  let offerData;

  beforeEach(() => {
    offerData = cloneOffer();
  });

  test("adds url and external to actions with href property", () => {
    const updated = addURLtoOffer(offerData);
    const nextOfferLink = sampleData.links.next_offer;
    const withHref = updated.children[0].children[0].children[1].children[0];
    expect(withHref).toBeDefined();
    expect(withHref.attributes.href).toBeDefined();
    expect(withHref.url).toBe(nextOfferLink);
    expect(withHref.attributes.external).toBe(true);
  });

  test("does nothing for actions without an href property", () => {
    const updated = addURLtoOffer(offerData);
    const withoutHref = updated.children[0].children[0].children[1].children[1];
    expect(withoutHref).toBeDefined();
    expect(withoutHref.href).toBeUndefined();
    expect(withoutHref.url).toBeDefined();
    expect(withoutHref.attributes).toBeUndefined();
  });

  test("returns offer unchanged when no links.next_offer", () => {
    delete offerData.links;
    const updated = addURLtoOffer(offerData);
    const btn = updated.children[0].children[0].children[1].children[0];
    expect(btn.url).toBeUndefined();
  });
});

describe("UptickOffer", () => {
  test("renders loading state when loading is true and offer is null", () => {
    const { container } = render(<UptickOffer offer={null} loading={true} />);
    expect(container.querySelector("s-grid")).not.toBeNull();
    expect(container.querySelector("s-spinner")).not.toBeNull();
    expect(container.querySelector("s-skeleton-paragraph")).not.toBeNull();
  });

  test("renders nothing when offer is null and not loading", () => {
    const { container } = render(<UptickOffer offer={null} loading={false} />);
    expect(container.innerHTML).toBe("");
  });

  test("renders nothing when offer is false", () => {
    const { container } = render(<UptickOffer offer={false} loading={false} />);
    expect(container.innerHTML).toBe("");
  });

  test("renders offer children through Generator", () => {
    const offer = cloneOffer();
    const nextOffer = jest.fn();
    const { container } = render(<UptickOffer offer={offer} loading={false} nextOffer={nextOffer} />);

    expect(container.querySelector("s-box")).not.toBeNull();
    expect(container.querySelector("s-grid")).not.toBeNull();
    expect(container.querySelector("s-text").textContent).toBe("Welcome to Uptick!");
    expect(container.querySelector("s-button").textContent).toBe("Claim your $20");
    expect(container.querySelector("s-link").textContent).toBe("Forfeit your $20");
  });

  test("accept action calls nextOffer with next offer url", () => {
    const offer = cloneOffer();
    const nextOffer = jest.fn();
    const { container } = render(<UptickOffer offer={offer} loading={false} nextOffer={nextOffer} />);

    container.querySelector("s-button").dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(nextOffer).toHaveBeenCalledWith(sampleData.links.next_offer);
  });

  test("reject action calls nextOffer with reject url", () => {
    const offer = cloneOffer();
    const nextOffer = jest.fn();
    const { container } = render(<UptickOffer offer={offer} loading={false} nextOffer={nextOffer} />);

    container.querySelector("s-link").dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(nextOffer).toHaveBeenCalledWith("https://app.uptick.com/reject");
  });

  test("renders children passthrough", () => {
    const offer = cloneOffer();
    const { container } = render(
      <UptickOffer offer={offer} loading={false}>
        <s-text>Debug Info</s-text>
      </UptickOffer>
    );

    const texts = container.querySelectorAll("s-text");
    const debugText = Array.from(texts).find(el => el.textContent === "Debug Info");
    expect(debugText).not.toBeNull();
  });

  test("deprecated rejected param maps to loading", () => {
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    const { container } = render(<UptickOffer offer={null} rejected={true} />);

    expect(container.querySelector("s-spinner")).not.toBeNull();
    expect(warnSpy).toHaveBeenCalledWith("The 'rejected' parameter is deprecated. Please use the 'loading' parameter instead.");
    warnSpy.mockRestore();
  });

  test("deprecated rejectOffer param maps to nextOffer", () => {
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    const rejectFn = jest.fn();
    const offer = cloneOffer();
    render(<UptickOffer offer={offer} loading={false} rejectOffer={rejectFn} />);

    expect(warnSpy).toHaveBeenCalledWith("rejectOffer is deprecated, please use nextOffer parameter instead.");
    warnSpy.mockRestore();
  });

  test("renders nothing when offer is null with no loading param", () => {
    const { container } = render(<UptickOffer offer={null} />);
    expect(container.innerHTML).toBe("");
  });
});
