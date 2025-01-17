import {
  describe,
  expect,
  test,
  jest,
  afterAll
} from "@jest/globals";
import Api from "./api";
import merge from "deepmerge";
import { isPresent } from "../utilities/present";

const offerUrlBase = "https://api.uptick.com/v1/places/place-id/flows/flow-id/offers/new?event_id=event-id&index=0";

function createApi(includeShopApi = true, { integrationId = null } = {}) {
  const shopApi = {
    shop: {
      id: "shopid",
      name: "The Shop",
      myshopifyDomain: "shop.shopify.com"
    },
    shippingAddress: {
      current: {
        firstName: "Bob",
        countryCode: "USA",
        zip: "84043"
      }
    },
    order: {
      current: {
        name: "#123"
      }
    },
    cost: {
      totalAmount: {
        current: {
          currencyCode: "USD",
          amount: 853.25
        }
      },
      totalShippingAmount: {
        current: {
          amount: 75.32
        }
      }
    }
  };

  const api = new Api({
    integrationId: integrationId,
    captureException: jest.fn((x) => x),
    captureWarning: jest.fn((x) => x)
  });
  api.setup({
    shopApi: includeShopApi ? shopApi : {
      shop: { // domain is minimum needed
        myshopifyDomain: "shop.shopify.com"
      }
    },
    setLoading: jest.fn((x) => x)
  });
  return api;
}

function generateFlowURL(api, placement, integrationID = null) {
  if (isPresent(integrationID)) {
    expect(api.flowURL).toBe(`https://api.uptick.com/v2/places/${integrationID}/flows/new`);
  } else {
    expect(api.flowURL).toBe("https://api.uptick.com/places/flows/shopify");
  }

  const url = new URL(api.flowURL);
  url.searchParams.set("api_versions[]", "v1");
  url.searchParams.append("api_versions[]", "v2");
  url.searchParams.set("placement", placement);
  url.searchParams.set("shop_myshopify_domain", api.shopApi.shop.myshopifyDomain);

  return url.toString();
}

function generateOfferURL(api) {
  const url = new URL(offerUrlBase);

  if (api.shopApi?.shop?.id != null) {
    url.searchParams.set("shop_id", api.shopApi.shop.id);
  }
  if (api.shopApi?.shop?.name != null) {
    url.searchParams.set("shop_name", api.shopApi.shop.name);
  }

  if (api.shopApi?.order != null) {
    url.searchParams.set("order_name", api.shopApi.order.current.name);
  }

  if (api.shopApi?.cost != null) {
    url.searchParams.set("currency", api.shopApi.cost.totalAmount.current.currencyCode);
    url.searchParams.set("total_price", api.shopApi.cost.totalAmount.current.amount);
    url.searchParams.set("shipping_price", api.shopApi.cost.totalShippingAmount.current.amount);
  }

  if (api.shopApi?.shippingAddress != null) {
    url.searchParams.set("first_name", api.shopApi.shippingAddress.current.firstName);
    url.searchParams.set("country_code", api.shopApi.shippingAddress.current.countryCode);
    url.searchParams.set("zip", api.shopApi.shippingAddress.current.zip);
  }

  return url.toString();
}

afterAll(() => {
  jest.restoreAllMocks();
});

describe("api", () => {
  describe("constructor", () => {

    test("sets defaults on empty constructor", async () => {
      let api = new Api();

      // These are all the same for test or development
      expect(api.baseURL).toBe("https://api.uptick.com");
      expect(api.flowURL).toBe("https://api.uptick.com/places/flows/shopify");
      expect(api.captureException).toBeDefined();
      expect(api.captureWarning).toBeDefined();
      expect(api.setLoading).toBeDefined();
      expect(api.flow).toBeNull();
    });

    test("sets defaults with integrationId on constructor", async () => {
      let api = new Api({ integrationId: "AAAAAAAA-BBBB-CCCC-DDDD-EEEEEEEEEEEE" });

      // These are all the same for test or development
      expect(api.baseURL).toBe("https://api.uptick.com");
      expect(api.flowURL).toBe("https://api.uptick.com/v2/places/AAAAAAAA-BBBB-CCCC-DDDD-EEEEEEEEEEEE/flows/new");
      expect(api.captureException).toBeDefined();
      expect(api.captureWarning).toBeDefined();
      expect(api.setLoading).toBeDefined();
      expect(api.flow).toBeNull();
    });

    test("sets defaults with integrationId for v1 on constructor", async () => {
      let api = new Api({ integrationId: "AAAAAAAA-BBBB-CCCC-DDDD-EEEEEEEEEEEE", apiVersion: "v1" });

      // These are all the same for test or development
      expect(api.baseURL).toBe("https://api.uptick.com");
      expect(api.flowURL).toBe("https://api.uptick.com/v1/places/AAAAAAAA-BBBB-CCCC-DDDD-EEEEEEEEEEEE/flows/new");
      expect(api.captureException).toBeDefined();
      expect(api.captureWarning).toBeDefined();
      expect(api.setLoading).toBeDefined();
      expect(api.flow).toBeNull();
    });

    test("raises error when baseURL is missing", async () => {
      expect(() => {
        new Api({ baseURL: "" });
      }).toThrow("baseURL is required.");
    });

    test("can set properties", async () => {
      let noop = () => {};
      let api = new Api({
        captureException: noop,
        captureWarning: noop
      });

      expect(api.captureException).toBe(noop);
      expect(api.captureWarning).toBe(noop);
    });
  });

  describe("setup", () => {
    test("can set properties", async () => {
      // Initialize bare minimum
      let shopApi = {
        shop: { // domain is minimum needed
          myshopifyDomain: "shop.shopify.com"
        }
      };
      let noop = () => {};
      let api = new Api();
      api.setup({ shopApi, setLoading: noop });

      expect(api.shopApi).toBe(shopApi);
      expect(api.setLoading).toBe(noop);
    });

    test("will default setLoading", async () => {
      // Initialize bare minimum
      let shopApi = {
        shop: { // domain is minimum needed
          myshopifyDomain: "shop.shopify.com"
        }
      };
      let api = new Api();
      api.setup({ shopApi, setLoading: null });

      expect(api.shopApi).toBe(shopApi);
      expect(api.setLoading).toBe(api.noop);
    });
  });

  describe("getInitialOffer", () => {

    test("if shopApi is null returns", async () => {
      const api = new Api({ captureException: jest.fn((x) => x) });
      api.setup({ setLoading: jest.fn((x) => x) });
      const result = await api.getInitialOffer("order_status");
      expect(result).toBe(false);

      expect(api.setLoading).toHaveBeenCalledTimes(0);

      expect(api.captureException).toHaveBeenCalledTimes(1);
      expect(api.captureException).toHaveBeenCalledWith(new Error("Shop API is required."));
    });

    test("if placement is invalid returns", async () => {
      const api = createApi();
      const result = await api.getInitialOffer("something");
      expect(result).toBe(false);

      expect(api.setLoading).toHaveBeenCalledTimes(0);

      expect(api.captureException).toHaveBeenCalledTimes(1);
      expect(api.captureException).toHaveBeenCalledWith(new Error("Placement must be order_status or order_confirmation"), { extra: { placement: "something" } });
    });

    test("if flow already exists returns", async () => {
      const api = createApi();
      api.flow = true;
      const result = await api.getInitialOffer("order_confirmation");
      expect(result).toBe(false);

      expect(api.setLoading).toHaveBeenCalledTimes(0);

      expect(api.captureException).toHaveBeenCalledTimes(1);
      expect(api.captureException).toHaveBeenCalledWith(new Error("getInitialOffer was already called."));
    });

    test("if flow result is null returns", async () => {
      const api = createApi();
      jest.spyOn(api, "fetchResult").mockImplementation(() => null);
      jest.spyOn(api, "offerViewedEvent").mockImplementation(() => null);

      const result = await api.getInitialOffer("order_confirmation");

      expect(result).toBe(false);
      expect(api.fetchResult).toHaveBeenCalledTimes(1);
      expect(api.fetchResult).toHaveBeenCalledWith(generateFlowURL(api, "order_confirmation"), { method: undefined, setLoader: api.noop });

      expect(api.offerViewedEvent).toHaveBeenCalledTimes(0);

      expect(api.setLoading).toHaveBeenCalledTimes(2);
      expect(api.captureException).toHaveBeenCalledTimes(0);
      expect(api.captureWarning).toHaveBeenCalledTimes(1);
      expect(api.captureWarning).toHaveBeenCalledWith("Unable to get flow. Response was null.");
    });

    test("if links is empty returns", async () => {
      const returnResult = {
        links: {}
      };

      const api = createApi();
      jest.spyOn(api, "fetchResult").mockImplementation(() => returnResult);
      jest.spyOn(api, "offerViewedEvent").mockImplementation(() => null);

      const result = await api.getInitialOffer("order_confirmation");

      expect(result).toBe(false);
      expect(api.fetchResult).toHaveBeenCalledTimes(1);
      expect(api.fetchResult).toHaveBeenCalledWith(generateFlowURL(api, "order_confirmation"), { method: undefined, setLoader: api.noop });

      expect(api.offerViewedEvent).toHaveBeenCalledTimes(0);

      expect(api.setLoading).toHaveBeenCalledTimes(2);
      expect(api.captureException).toHaveBeenCalledTimes(0);
      expect(api.captureWarning).toHaveBeenCalledTimes(1);
      expect(api.captureWarning).toHaveBeenCalledWith("Flow did not contain first offer.");
    });

    test("if flow response is valid calls getOfferBase", async () => {
      const api = createApi();
      const returnResult = {
        links: {
          next_offer: "flow_url"
        }
      };
      jest.spyOn(api, "fetchResult").mockImplementation(() => returnResult);
      jest.spyOn(api, "offerViewedEvent").mockImplementation(() => null);
      jest.spyOn(api, "getOfferBase").mockImplementation(() => "offer");

      const result = await api.getInitialOffer("order_confirmation");
      expect(result).toBe("offer");

      expect(api.fetchResult).toHaveBeenCalledTimes(1);
      expect(api.fetchResult).toHaveBeenCalledWith(generateFlowURL(api, "order_confirmation"), { method: undefined, setLoader: api.noop });

      expect(api.offerViewedEvent).toHaveBeenCalledTimes(0);
      expect(api.getOfferBase).toHaveBeenCalledTimes(1);

      expect(api.setLoading).toHaveBeenCalledTimes(2);
      expect(api.captureException).toHaveBeenCalledTimes(0);
      expect(api.captureWarning).toHaveBeenCalledTimes(0);
    });

    test("with integrationID if flow response is valid calls getOfferBase", async () => {
      const api = createApi(true, { integrationId: "AAAAAAAA-BBBB-CCCC-DDDD-EEEEEEEEEEEE" });
      const returnResult = {
        links: {
          next_offer: "flow_url"
        }
      };
      jest.spyOn(api, "fetchResult").mockImplementation(() => returnResult);
      jest.spyOn(api, "offerViewedEvent").mockImplementation(() => null);
      jest.spyOn(api, "getOfferBase").mockImplementation(() => "offer");

      const result = await api.getInitialOffer("order_confirmation");
      expect(result).toBe("offer");

      expect(api.fetchResult).toHaveBeenCalledTimes(1);
      expect(api.fetchResult).toHaveBeenCalledWith(generateFlowURL(api, "order_confirmation", "AAAAAAAA-BBBB-CCCC-DDDD-EEEEEEEEEEEE"), { method: undefined, setLoader: api.noop });

      expect(api.offerViewedEvent).toHaveBeenCalledTimes(0);
      expect(api.getOfferBase).toHaveBeenCalledTimes(1);

      expect(api.setLoading).toHaveBeenCalledTimes(2);
      expect(api.captureException).toHaveBeenCalledTimes(0);
      expect(api.captureWarning).toHaveBeenCalledTimes(0);
    });

    // test("if set with custom flowURL", async () => {
    //   // Initialize bare minimum
    //   let shopApi = {
    //     shop: { // domain is minimum needed
    //       myshopifyDomain: "shop.shopify.com"
    //     }
    //   };
    //   let api = new Api({ flowURL: "https://api.uptick.test/places/flows/shopify" });
    //   api.setup({ shopApi, setLoading: jest.fn((x) => x) });

    //   // These are all the same for test or development
    //   expect(api.flowURL).toBe("https://api.uptick.test/places/flows/shopify");

    //   // Check flow url
    //   jest.spyOn(api, "fetchResult").mockImplementation(() => null);
    //   await api.getInitialOffer("order_confirmation");

    //   expect(api.fetchResult).toHaveBeenCalledWith("https://api.uptick.test/places/flows/shopify?api_versions%5B%5D=v1&placement=order_confirmation&shop_myshopify_domain=shop.shopify.com", { setLoader: api.setLoading });
    // });

  });

  describe("getNextOffer", () => {
    test("if shopApi is null returns", async () => {
      const api = new Api({ captureException: jest.fn((x) => x) });
      api.setup({ setLoading: jest.fn((x) => x) });
      const result = await api.getNextOffer("reject_url");
      expect(result).toBe(false);

      expect(api.setLoading).toHaveBeenCalledTimes(0);

      expect(api.captureException).toHaveBeenCalledTimes(1);
      expect(api.captureException).toHaveBeenCalledWith(new Error("Shop API is required."));
    });

    test("if flow is null returns", async () => {
      const api = createApi();
      const result = await api.getNextOffer("reject_url");
      expect(result).toBe(false);

      expect(api.setLoading).toHaveBeenCalledTimes(0);

      expect(api.captureException).toHaveBeenCalledTimes(1);
      expect(api.captureException).toHaveBeenCalledWith(new Error("getInitialOffer was not called first or wasn't successful."));
    });

    test("if rejectUrl is blank returns", async () => {
      const api = createApi();
      api.flow = true;
      const result = await api.getNextOffer("");
      expect(result).toBe(false);

      expect(api.setLoading).toHaveBeenCalledTimes(0);

      expect(api.captureException).toHaveBeenCalledTimes(1);
      expect(api.captureException).toHaveBeenCalledWith(new Error("Reject URL is required."));
    });

    test("will successfully call getOfferBase", async () => {
      const api = createApi();
      api.flow = true;

      jest.spyOn(api, "getOfferBase").mockImplementation(() => "offer");
      jest.spyOn(api, "offerViewedEvent").mockImplementation(() => null);

      const result = await api.getNextOffer("reject_url");
      expect(result).toBe("offer");

      expect(api.getOfferBase).toHaveBeenCalledTimes(1);
      expect(api.getOfferBase).toHaveBeenCalledWith("reject_url", { method: "POST", setLoader: api.setLoading });

      expect(api.offerViewedEvent).toHaveBeenCalledTimes(0);

      expect(api.setLoading).toHaveBeenCalledTimes(0);
      expect(api.captureException).toHaveBeenCalledTimes(0);
      expect(api.captureWarning).toHaveBeenCalledTimes(0);
    });
  });

  describe("getOfferBase", () => {
    test("if offer is null returns", async () => {
      const api = createApi(false);
      jest.spyOn(api, "fetchResult").mockImplementation(() => null);
      jest.spyOn(api, "offerViewedEvent").mockImplementation(() => null);

      const result = await api.getOfferBase(offerUrlBase, { method: "GET", setLoader: api.setLoading });
      expect(result).toBe(false);

      expect(api.fetchResult).toHaveBeenCalledTimes(1);
      expect(api.fetchResult).toHaveBeenCalledWith(generateOfferURL(api), { method: "GET", setLoader: api.setLoading });

      expect(api.offerViewedEvent).toHaveBeenCalledTimes(0);

      expect(api.setLoading).toHaveBeenCalledTimes(0);
      expect(api.captureException).toHaveBeenCalledTimes(0);
      expect(api.captureWarning).toHaveBeenCalledTimes(1);
      expect(api.captureWarning).toHaveBeenCalledWith("Unable to get offer result was null.");
    });

    test("if offer data is null returns", async () => {
      const api = createApi(false);
      let returnResult = {
        data: null
      };
      jest.spyOn(api, "fetchResult").mockImplementation(() => returnResult);
      jest.spyOn(api, "offerViewedEvent").mockImplementation(() => null);

      const result = await api.getOfferBase(offerUrlBase, { method: "GET", setLoader: api.setLoading });
      expect(result).toBe(false);

      expect(api.fetchResult).toHaveBeenCalledTimes(1);
      expect(api.fetchResult).toHaveBeenCalledWith(generateOfferURL(api), { method: "GET", setLoader: api.setLoading });

      expect(api.offerViewedEvent).toHaveBeenCalledTimes(0);

      expect(api.setLoading).toHaveBeenCalledTimes(0);
      expect(api.captureException).toHaveBeenCalledTimes(0);
      expect(api.captureWarning).toHaveBeenCalledTimes(1);
      expect(api.captureWarning).toHaveBeenCalledWith("Unable to get offer, no data was present.");
    });

    test("if offer data is empty returns, no more offers available", async () => {
      const api = createApi(false);
      let returnResult = {
        data: []
      };
      jest.spyOn(api, "fetchResult").mockImplementation(() => returnResult);
      jest.spyOn(api, "offerViewedEvent").mockImplementation(() => null);

      const result = await api.getOfferBase(offerUrlBase, { method: "GET", setLoader: api.setLoading });
      expect(result).toBe(false);

      expect(api.fetchResult).toHaveBeenCalledTimes(1);
      expect(api.fetchResult).toHaveBeenCalledWith(generateOfferURL(api), { method: "GET", setLoader: api.setLoading });

      expect(api.offerViewedEvent).toHaveBeenCalledTimes(0);

      expect(api.setLoading).toHaveBeenCalledTimes(0);
      expect(api.captureException).toHaveBeenCalledTimes(0);
      expect(api.captureWarning).toHaveBeenCalledTimes(0);
    });

    test("if v1 data offer has no attributes returns", async () => {
      const api = createApi();
      const returnResult = {
        api_version: "v1",
        data: [{
          type: "offer"
        }]
      };
      jest.spyOn(api, "fetchResult").mockImplementation(() => returnResult);
      jest.spyOn(api, "offerViewedEvent").mockImplementation(() => null);

      const result = await api.getOfferBase(offerUrlBase, { method: "GET", setLoader: api.setLoading });
      expect(result).toBe(false);

      expect(api.fetchResult).toHaveBeenCalledTimes(1);
      expect(api.fetchResult).toHaveBeenCalledWith(generateOfferURL(api), { method: "GET", setLoader: api.setLoading });

      expect(api.offerViewedEvent).toHaveBeenCalledTimes(0);

      expect(api.setLoading).toHaveBeenCalledTimes(0);
      expect(api.captureException).toHaveBeenCalledTimes(0);
      expect(api.captureWarning).toHaveBeenCalledTimes(1);
      expect(api.captureWarning).toHaveBeenCalledWith("Offer contained no data.");
    });

    test("if v2 data offer has no children returns", async () => {
      const api = createApi();
      const returnResult = {
        api_version: "v2",
        data: [{
          type: "offer"
        }]
      };
      jest.spyOn(api, "fetchResult").mockImplementation(() => returnResult);
      jest.spyOn(api, "offerViewedEvent").mockImplementation(() => null);

      const result = await api.getOfferBase(offerUrlBase, { method: "GET", setLoader: api.setLoading });
      expect(result).toBe(false);

      expect(api.fetchResult).toHaveBeenCalledTimes(1);
      expect(api.fetchResult).toHaveBeenCalledWith(generateOfferURL(api), { method: "GET", setLoader: api.setLoading });

      expect(api.offerViewedEvent).toHaveBeenCalledTimes(0);

      expect(api.setLoading).toHaveBeenCalledTimes(0);
      expect(api.captureException).toHaveBeenCalledTimes(0);
      expect(api.captureWarning).toHaveBeenCalledTimes(1);
      expect(api.captureWarning).toHaveBeenCalledWith("Offer contained no data.");
    });

    test("if v1 data is type offer sets correctly", async () => {
      const api = createApi();
      const returnResult = {
        api_version: "v1",
        data: [{
          type: "offer",
          attributes: {
            something: true
          }
        }]
      };
      jest.spyOn(api, "fetchResult").mockImplementation(() => returnResult);
      jest.spyOn(api, "offerViewedEvent").mockImplementation(() => null);

      const result = await api.getOfferBase(offerUrlBase, { method: "GET", setLoader: api.setLoading });
      expect(result).toStrictEqual(merge(returnResult.data[0], { api_version: "v1" }));

      expect(api.fetchResult).toHaveBeenCalledTimes(1);
      expect(api.fetchResult).toHaveBeenCalledWith(generateOfferURL(api), { method: "GET", setLoader: api.setLoading });

      expect(api.offerViewedEvent).toHaveBeenCalledTimes(1);

      expect(api.setLoading).toHaveBeenCalledTimes(0);
      expect(api.captureException).toHaveBeenCalledTimes(0);
      expect(api.captureWarning).toHaveBeenCalledTimes(0);
    });

    test("if v2 data is type offer sets correctly", async () => {
      const api = createApi();
      const returnResult = {
        api_version: "v2",
        data: [{
          type: "offer",
          children: [{
            something: true
          }]
        }]
      };
      jest.spyOn(api, "fetchResult").mockImplementation(() => returnResult);
      jest.spyOn(api, "offerViewedEvent").mockImplementation(() => null);

      const result = await api.getOfferBase(offerUrlBase, { method: "GET", setLoader: api.setLoading });
      expect(result).toStrictEqual(merge(returnResult.data[0], { api_version: "v2" }));

      expect(api.fetchResult).toHaveBeenCalledTimes(1);
      expect(api.fetchResult).toHaveBeenCalledWith(generateOfferURL(api), { method: "GET", setLoader: api.setLoading });

      expect(api.offerViewedEvent).toHaveBeenCalledTimes(1);

      expect(api.setLoading).toHaveBeenCalledTimes(0);
      expect(api.captureException).toHaveBeenCalledTimes(0);
      expect(api.captureWarning).toHaveBeenCalledTimes(0);
    });

  });

  describe("offerViewedEvent", () => {
    test("sends event", async () => {
      const api = createApi({ captureException: jest.fn((x) => x) });
      jest.spyOn(api, "fetchResult").mockImplementation(() => "result");
      jest.spyOn(api, "getTimeStamp").mockImplementation(() => "timestamp1234");

      global.navigator = {
        language: "en-US",
        userAgent: "Chrome"
      };

      const offerResult = {
        data: [],
        links: {
          flow: "https://api.uptick.com/v1/places/integrationId1234/flows/727e2041-95dd-4ee9-887d-c702e0cf5cd1",
          offer_event: "https://api.uptick.com/v1/places/60b1add2-e873-453f-85a6-96fab0fa0b72/flows/2826f470-eab6-4615-a6e3-59ca43ac0502/events?eid=f7a5b7ac-2e41-4e16-882f-82a38d9c3902&offer_id=119&offer_index=0"
        }
      };

      const result = await api.offerViewedEvent(offerResult);
      expect(result).toBe("result");

      let url = new URL(offerResult.links.offer_event);
      url.searchParams.append("ev", "offer_viewed");
      url.searchParams.append("ts", "timestamp1234");
      url.searchParams.append("de", "en-US");
      url.searchParams.append("ua", "Chrome");

      expect(api.fetchResult).toHaveBeenCalledTimes(1);
      expect(api.fetchResult).toHaveBeenCalledWith(url.toString(), { method: "POST", setLoader: api.noop, parseJson: false });

      expect(api.setLoading).toHaveBeenCalledTimes(0);
      expect(api.captureException).toHaveBeenCalledTimes(0);
    });
  });

  describe("fetchResult", () => {
    test("fetches correctly", async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          json: () => Promise.resolve({ test: 100 }),
        }),
      );

      const api = createApi({ captureException: jest.fn((x) => x) });

      const result = await api.fetchResult("https://www.test.com", {
        method: "POST",
        setLoader: api.setLoading
      });

      expect(result).toStrictEqual({ test: 100 });

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith("https://www.test.com", {
        method: "POST",
        redirect: "follow",
        cache: "no-cache",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        }
      });

      expect(api.setLoading).toHaveBeenCalledTimes(2);
      expect(api.setLoading.mock.calls[0][0]).toBe(true);
      expect(api.setLoading.mock.calls[1][0]).toBe(false);

      expect(api.captureException).toHaveBeenCalledTimes(0);
    });

    test("handles error", async() => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          json: () => Promise.reject("failed"),
        }),
      );

      const api = createApi({ captureException: jest.fn((x) => x) });

      const result = await api.fetchResult("https://www.test.com", {
        method: "POST",
        setLoader: api.setLoading
      });

      expect(result).toBeNull();

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith("https://www.test.com", {
        method: "POST",
        redirect: "follow",
        cache: "no-cache",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        }
      });

      expect(api.setLoading).toHaveBeenCalledTimes(2);
      expect(api.setLoading.mock.calls[0][0]).toBe(true);
      expect(api.setLoading.mock.calls[1][0]).toBe(false);

      expect(api.captureException).toHaveBeenCalledTimes(1);
      expect(api.captureException).toHaveBeenCalledWith("failed", { extra: { url: "https://www.test.com", method: "POST", parseJson: true } });
    });
  });
});