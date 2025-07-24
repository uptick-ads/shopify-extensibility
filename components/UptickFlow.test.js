import {
  describe,
  expect,
  test,
  beforeEach
} from "@jest/globals";
import { addURLtoV1, addURLtoV2 } from "./UptickFlow.jsx";

const v1SampleData = {
  type: "offer",
  id: "1",
  attributes: {
    actions: [
      {
        type: "button",
        text: "Accept Offer",
        attributes: {
          to: "https://app.uptick.com/accept"
        }
      },
      {
        type: "button",
        text: "Decline Offer",
        url: "https://app.uptick.com/reject"
      }
    ]
  },
  links: {
    next_offer: "https://example.com/next_offer"
  }
};

describe("addURLtoV1", () => {
  let v1OfferData;

  beforeEach(() => {
    // clone the first offer and attach the top‐level links
    v1OfferData = JSON.parse(JSON.stringify(v1SampleData));
  });

  test("adds url and external to actions with to property", () => {
    const updated = addURLtoV1(v1OfferData);
    const nextOfferLink = v1SampleData.links.next_offer;
    // find the action that originally had a `to`
    const withTo = updated.attributes.actions.find(a => a.attributes?.to != null);
    expect(withTo).toBeDefined();
    expect(withTo.url).toBe(nextOfferLink);
    expect(withTo.attributes.external).toBe(true);
  });

  test("does nothing for actions without a to property", () => {
    const updated = addURLtoV1(v1OfferData);
    // find an action that had no `to`
    const withoutTo = updated.attributes.actions.find(a => a.attributes?.to == null);
    expect(withoutTo).toBeDefined();
    expect(withoutTo.url).toBeDefined();
    // external should not have been set to true
    expect(withoutTo.attributes).toBeUndefined();
  });
});

const v2SampleData = {
  type: "offer",
  id: "1",
  children: [
    {
      type: "view",
      children: [
        {
          type: "grid",
          children: [
            {
              type: "text",
              text: "Welcome to Uptick!"
            },
            {
              type: "view",
              children: [
                {
                  type: "button",
                  text: "Claim your $20",
                  name: "button-accept",
                  attributes: {
                    to: "https://app.uptick.com/evt/flows/b7677e93-9e84-4215-aecc-c8c1352dd77d/events/989496d0-bf25-42aa-98ac-6668e672c730/accept?index=1\u0026placement=order_confirmation"
                  }
                },
                {
                  type: "link",
                  name: "button-reject",
                  text: "Forfeit your $20",
                  url: "https://app.uptick.com/evt/flows/b7677e93-9e84-4215-aecc-c8c1352dd77d/events/989496d0-bf25-42aa-98ac-6668e672c730/reject?index=1\u0026placement=order_confirmation"
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

describe("addURLtoV2", () => {
  let v2OfferData;

  beforeEach(() => {
    // clone the first offer and attach the top‐level links
    v2OfferData = JSON.parse(JSON.stringify(v2SampleData));
  });

  test("adds url and external to actions with to property", () => {
    const updated = addURLtoV2(v2OfferData);
    const nextOfferLink = v2SampleData.links.next_offer;
    // find the action that originally had a `to`
    const withTo = updated.children[0].children[0].children[1].children[0];
    expect(withTo).toBeDefined();
    expect(withTo.attributes.to).toBeDefined();
    expect(withTo.url).toBe(nextOfferLink);
    expect(withTo.attributes.external).toBe(true);
  });

  test("does nothing for actions without a to property", () => {
    const updated = addURLtoV2(v2OfferData);
    // find an action that had no `to`
    const withoutTo = updated.children[0].children[0].children[1].children[1];
    expect(withoutTo).toBeDefined();
    expect(withoutTo.to).toBeUndefined();
    expect(withoutTo.url).toBeDefined();
    // external should not have been set to true
    expect(withoutTo.attributes).toBeUndefined();
  });
});