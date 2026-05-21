/**
 * @jest-environment jsdom
 */

import {
  describe,
  expect,
  test,
  jest
} from "@jest/globals";
import { render } from "@testing-library/preact";
import UptickOffer from "./UptickFlow.jsx";

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
                  url: "https://example.com/next_offer"
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

  test("renders nothing when offer is null with no loading param", () => {
    const { container } = render(<UptickOffer offer={null} />);
    expect(container.innerHTML).toBe("");
  });
});
