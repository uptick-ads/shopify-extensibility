import { isEmpty, isPresent } from "../utilities/present.js";

export default class Api {
  constructor({
    integrationId = null,
    captureWarning = null,
    captureException = null,
    baseURL = "https://api.uptick.com"
  } = {}) {
    if (isEmpty(baseURL)) {
      throw new Error("baseURL is required.");
    }

    // Initialize default functions
    if (captureException == null) {
      captureException = (exception, context) => { console.error(`Uptick Error: Exception: ${exception}. Context: ${context}`); };
    }

    if (captureWarning == null) {
      captureWarning = (message) => { console.warn(`Uptick Warning: ${message}`); };
    }

    // Set variables from constructor
    this.captureException = captureException;
    this.captureWarning = captureWarning;
    this.baseURL = baseURL;

    if (isPresent(integrationId)) {
      this.flowURL = `${this.baseURL}/places/${integrationId}/flows/new`;
    } else {
      this.flowURL = `${this.baseURL}/places/flows/shopify`;
    }

    // Set defaults
    this.noop = () => {};
    this.setLoading = this.noop;
    this.flow = null;
  }

  setup({ shopApi, setLoading }) {
    this.shopApi = shopApi;
    this.setLoading = setLoading || this.noop;
  }

  // placement is order_confirmation | order_status
  async getInitialOffer(placement) {
    if (this.shopApi == null) {
      this.captureException(new Error("Shop API is required."));
      return false;
    }

    if (["order_status", "order_confirmation"].includes(placement) === false) {
      this.captureException(new Error("Placement must be order_status or order_confirmation"), { extra: { placement: placement } });
      return false;
    }

    if (this.flow != null) {
      this.captureException(new Error("getInitialOffer was already called."));
      return false;
    }

    // Get flow to use for all offers
    const url = new URL(this.flowURL);

    try {
      url.searchParams.set("api_versions[]", "v1");
      url.searchParams.append("api_versions[]", "v2");

      url.searchParams.set("placement", placement);
      url.searchParams.set("shop_myshopify_domain", this.shopApi.shop.myshopifyDomain);

      this.setLoading(true);
      this.flow = await this.fetchResult(url.toString(), { setLoader: this.noop });

      if (this.flow == null) {
        this.captureWarning("Unable to get flow. Response was null.");
        return false;
      }

      if (isEmpty(this.flow?.links?.next_offer)) {
        this.captureWarning("Flow did not contain first offer.");
        return false;
      }

      return await this.getOfferBase(this.flow.links.next_offer, { setLoader: this.noop });
    } catch (error) {
      this.captureException(error, { extra: { url: url.toString() } });
      return false;
    } finally {
      this.setLoading(false);
    }
  }

  async getNextOffer(rejectURL) {
    if (this.shopApi == null) {
      this.captureException(new Error("Shop API is required."));
      return false;
    }

    if (this.flow == null) {
      this.captureException(new Error("getInitialOffer was not called first or wasn't successful."));
      return false;
    }

    if (isEmpty(rejectURL)) {
      this.captureException(new Error("Reject URL is required."));
      return false;
    }

    return await this.getOfferBase(rejectURL, { method: "POST", setLoader: this.setLoading });
  }

  async getOfferBase(offerURL, { method, setLoader }) {
    const url = new URL(offerURL);

    try {
      // Shop information
      this.addParam(url, this.shopApi?.shop?.id, "shop_id");
      this.addParam(url, this.shopApi?.shop?.name, "shop_name");
      this.addParam(url, this.shopApi?.shop?.storefrontUrl, "dl");
      this.addParam(url, this.shopApi?.shop?.storefrontUrl, "rl");

      // Order Price information
      this.addParam(url, this.shopApi?.orderConfirmation?.current?.number || this.shopApi?.order?.current?.confirmationNumber, "confirmation_number");
      this.addParam(url, this.shopApi?.order?.current?.name || this.shopApi?.orderConfirmation?.current?.number, "order_name");
      this.addParam(url, this.shopApi?.cost?.totalAmount?.current?.currencyCode, "currency");
      this.addParam(url, this.shopApi?.cost?.totalAmount?.current?.amount, "total_price");
      this.addParam(url, this.shopApi?.cost?.totalShippingAmount?.current?.amount, "shipping_price");

      // Address information (may fail if shop doesn't have access)
      this.addParam(url, this.shopApi?.shippingAddress?.current?.firstName || this.shopApi?.billingAddress?.current?.firstName, "first_name");
      this.addParam(url, this.shopApi?.shippingAddress?.current?.countryCode || this.shopApi?.billingAddress?.current?.countryCode, "country_code");
      this.addParam(url, this.shopApi?.shippingAddress?.current?.zip || this.shopApi?.billingAddress?.current?.zip, "zip");

      this.addParam(url, this.shopApi?.extension?.target, "target");
      this.addParam(url, this.shopApi?.extension?.version, "script_version");
      this.addParam(url, this.shopApi?.extension?.apiVersion, "api_version");
    } catch (error) {
      this.captureException(error, { extra: { message: "Unable to get shop api information" } });
    }

    const offerResult = await this.fetchResult(url.toString(), { method, setLoader });

    if (offerResult == null) {
      this.captureWarning("Unable to get offer result was null.");
      return false;
    }

    if (offerResult.data == null) {
      this.captureWarning("Unable to get offer, no data was present.");
      return false;
    }

    const offerData = offerResult.data.find((item) => item.type === "offer");
    if (offerData == null) {
      // No more offers
      return false;
    }

    // V1 uses attributes, V2 uses children
    if (offerData.attributes == null && offerData.children == null) {
      this.captureWarning("Offer contained no data.");
      return false;
    }

    // bring api version down
    offerData.api_version = offerResult.api_version;
    // Send without blocking
    this.offerViewedEvent(offerResult);
    return offerData;
  }

  async offerViewedEvent(offerResult) {
    if (isEmpty(offerResult?.links?.offer_event)) {
      this.captureWarning("Unable to find offer event link from offer.");
      return;
    }

    try {
      let url = new URL(offerResult.links.offer_event);

      this.addParam(url, "offer_viewed", "ev"); // Event Type
      this.addParam(url, this.getTimeStamp(), "ts"); // Current Timestamp
      this.addParam(url, this.shopApi?.shop?.storefrontUrl, "dl"); // Location
      this.addParam(url, this.shopApi?.shop?.storefrontUrl, "rl"); // Referrer
      if (navigator != null) { // Window doesn't exist
        this.addParam(url, navigator?.language, "de"); // Navigator Language
        this.addParam(url, navigator?.userAgent, "ua"); // User Agent string
      }

      return this.fetchResult(url.toString(), { method: "POST", setLoader: this.noop, parseJson: false });
    } catch (error) {
      this.captureException(error, { extra: { message: "Unable to send offer viewed event" } });
    }
  }

  getTimeStamp() {
    return new Date().getTime();
  }

  addParam(url, value, query_param_key) {
    try {
      if (isPresent(value)) {
        url.searchParams.set(query_param_key, value);
      }
    } catch (error) {
      this.captureException(error, { extra: { message: "Unable to set shop api key", query_param_key: query_param_key, value: value } });
    }
  }

  async fetchResult(url, { method = "GET", setLoader, parseJson = true }) {
    setLoader(true);

    try {
      let rawResult = await fetch(url, {
        method: method ?? "GET",
        redirect: "follow",
        cache: "no-cache",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      if (parseJson) {
        return await rawResult.json();
      }

      return rawResult.body;
    } catch (error) {
      this.captureException(error, { extra: { url: url, method: method, parseJson: parseJson } });
      return null;
    } finally {
      setLoader(false);
    }
  }
}
