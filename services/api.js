import { isEmpty, isPresent } from "../utilities/present.js";
import {
  buildFetchFailureContext,
  mergeCaptureContext,
} from "../utilities/fetchFailureContext.js";

const MAX_REDIRECTS = 3;
const MAX_SAFE_FETCH_ATTEMPTS = 2;
const SAFE_FETCH_RETRY_DELAY_MS = 150;
const OFFER_VIEWED_CAPTURE_SAMPLE_RATE = 0.1;
const FETCH_TIMEOUT_MS = 8000;
const INTEGRATION_TYPE = "shopify_extensibility";
const INTEGRATION_VERSION = "1.1.0";

export default class Api {
  constructor({
    integrationId = null,
    captureWarning = null,
    captureException = null,
    baseURL = "https://api.uptick.com",
    options = {}
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
    this.options = options || {};

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
      this.captureException(new Error("Placement must be order_status or order_confirmation"), { extra: { placement } });
      return false;
    }

    if (this.flow != null) {
      this.captureException(new Error("getInitialOffer was already called."));
      return false;
    }

    // Get flow to use for all offers
    const url = new URL(this.flowURL);

    try {
      this.addParam(url, placement, "placement");
      this.addParam(url, this.shopApi.shop.myshopifyDomain, "shop_myshopify_domain");

      this.addParam(url, this.shopApi?.shop?.storefrontUrl, "dl");
      this.addParam(url, this.shopApi?.shop?.storefrontUrl, "rl");

      // Pass editor context if present (theme/checkout editor preview)
      if (this.shopApi?.extension?.editor) {
        // await new Promise(resolve => setTimeout(resolve, 100000));
        url.searchParams.set("editor", "1");
      }

      // Add options to URL
      this.addOptionsToUrl(url);

      // Avoid CORS redirect issues in Safari for the /shopify endpoint
      if (this.flowURL.endsWith("/places/flows/shopify")) {
        url.searchParams.set("no_redirect", "1");
      }

      this.setLoading(true);
      this.flow = await this.fetchResult(url.toString(), { setLoader: this.noop });

      // Handle no_redirect response — follow flow_url if present
      if (isPresent(this.flow?.flow_url)) {
        const flowUrl = this.flow.flow_url;
        this.flow = await this.fetchResult(flowUrl, { setLoader: this.noop });

        if (isPresent(this.flow?.flow_url)) {
          this.captureException(new Error("Unexpected second flow_url redirect."), { extra: { flow_url: this.flow.flow_url } });
          return false;
        }
      }

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

  async getNextOffer(nextOfferURL) {
    if (this.shopApi == null) {
      this.captureException(new Error("Shop API is required."));
      return false;
    }

    if (this.flow == null) {
      this.captureException(new Error("getInitialOffer was not called first or wasn't successful."));
      return false;
    }

    if (isEmpty(nextOfferURL)) {
      this.captureException(new Error("Next offer URL is required."));
      return false;
    }

    let method = "POST";
    if (nextOfferURL.toLowerCase().includes("offers/new")) {
      method = "GET"; // New offers are fetched with GET
    }

    return await this.getOfferBase(nextOfferURL, { method, setLoader: this.setLoading });
  }

  async getOfferBase(offerURL, { method, setLoader, _redirectCount = 0 } = {}) {
    if (_redirectCount >= MAX_REDIRECTS) {
      this.captureException(new Error("Maximum offer redirects exceeded."), { extra: { offerURL, _redirectCount } });
      return false;
    }

    const url = new URL(offerURL);

    try {
      // Shop information
      this.addParam(url, this.shopApi?.shop?.id, "shop_id");
      this.addParam(url, this.shopApi?.shop?.name, "shop_name");
      this.addParam(url, this.shopApi?.shop?.storefrontUrl, "dl");
      this.addParam(url, this.shopApi?.shop?.storefrontUrl, "rl");

      // Order Price information
      this.addParam(url, this.shopApi?.orderConfirmation?.current?.number || this.shopApi?.order?.current?.confirmationNumber, "confirmation_number");
      this.addParam(url, this.shopApi?.order?.current?.name, "order_name");
      this.addParam(url, this.shopApi?.cost?.totalAmount?.current?.currencyCode, "currency");
      this.addParam(url, this.shopApi?.cost?.totalAmount?.current?.amount, "total_price");
      this.addParam(url, this.shopApi?.cost?.totalShippingAmount?.current?.amount, "shipping_price");

      // Customer information
      this.addParam(url, this.shopApi?.buyerIdentity?.customer?.current?.id, "customer_id");

      // Address information (may fail if shop doesn't have access)
      this.addParam(url, this.shopApi?.shippingAddress?.current?.firstName || this.shopApi?.billingAddress?.current?.firstName, "first_name");
      this.addParam(url, this.shopApi?.shippingAddress?.current?.countryCode || this.shopApi?.billingAddress?.current?.countryCode, "country_code");
      this.addParam(url, this.shopApi?.shippingAddress?.current?.zip || this.shopApi?.billingAddress?.current?.zip, "zip");

      this.addParam(url, this.shopApi?.extension?.target, "shop_target");
      this.addParam(url, this.shopApi?.extension?.version, "shop_script_version");
      this.addParam(url, this.shopApi?.extension?.apiVersion, "shop_api_version");

      // Add options to URL
      this.addOptionsToUrl(url);
    } catch (error) {
      this.captureException(error, { extra: { message: "Unable to get shop api information" } });
    }

    // Avoid CORS redirect issues for reject endpoints
    if (method === "POST") {
      url.searchParams.set("no_redirect", "1");
    }

    const offerResult = await this.fetchResult(url.toString(), { method, setLoader });

    // Handle no_redirect response — follow next_offer_url if present
    if (isPresent(offerResult?.next_offer_url)) {
      return await this.getOfferBase(offerResult.next_offer_url, { setLoader, _redirectCount: _redirectCount + 1 });
    }

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

    if (offerData.children == null) {
      this.captureWarning("Offer contained no data.");
      return false;
    }

    offerData.links = offerResult.links;
    // Send without blocking
    Promise.resolve(this.offerViewedEvent(offerResult)).catch((error) => {
      this.captureException(error, { extra: { message: "Unhandled error in offerViewedEvent" } });
    });
    return offerData;
  }

  async offerViewedEvent(offerResult) {
    if (isEmpty(offerResult?.links?.offer_event)) {
      this.captureWarning("Unable to find offer event link from offer.");
      return;
    }

    const telemetryCaptureContext = {
      level: "warning",
      extra: {
        non_blocking: true,
        telemetry_event: "offer_viewed",
      },
      tags: {
        "uptick.non_blocking": "true",
        "uptick.request_importance": "telemetry",
        "uptick.telemetry_event": "offer_viewed",
      },
    };

    try {
      let url = new URL(offerResult.links.offer_event);

      this.addParam(url, "offer_viewed", "ev"); // Event Type
      this.addParam(url, this.getTimeStamp(), "ts"); // Current Timestamp
      this.addParam(url, this.shopApi?.shop?.storefrontUrl, "dl"); // Location
      this.addParam(url, this.shopApi?.shop?.storefrontUrl, "rl"); // Referrer
      if (typeof navigator !== "undefined") {
        this.addParam(url, navigator?.language, "de"); // Navigator Language
        this.addParam(url, navigator?.userAgent, "ua"); // User Agent string
      }

      return await this.fetchResult(url.toString(), {
        method: "POST",
        setLoader: this.noop,
        parseJson: false,
        captureContext: telemetryCaptureContext,
        captureFailureSampleRate: OFFER_VIEWED_CAPTURE_SAMPLE_RATE,
      });
    } catch (error) {
      // Offer-viewed telemetry should not affect rendering or pollute error monitoring.
      if (this.shouldCaptureFetchFailure(OFFER_VIEWED_CAPTURE_SAMPLE_RATE)) {
        this.captureException(error, {
          message: "Offer viewed event failed:",
          ...telemetryCaptureContext,
        });
      }
    }
  }

  getTimeStamp() {
    return new Date().getTime();
  }

  addOptionsToUrl(url) {
    if (this.options && typeof this.options === "object") {
      Object.keys(this.options).forEach(key => {
        const value = this.options[key];
        if (isPresent(value)) {
          this.addParam(url, value, key);
        }
      });
    }
  }

  addParam(url, value, query_param_key) {
    try {
      if (isPresent(value)) {
        url.searchParams.set(query_param_key, value);
      }
    } catch (error) {
      this.captureException(error, { extra: { message: "Unable to set shop api key", query_param_key, value } });
    }
  }

  retryableFetchFailure({ method, phase, response }) {
    return method === "GET" && phase === "fetch" && response == null;
  }

  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  urlWithIntegrationParams(url) {
    try {
      const requestUrl = new URL(url);

      requestUrl.searchParams.set("integration_type", INTEGRATION_TYPE);
      requestUrl.searchParams.set("integration_version", INTEGRATION_VERSION);

      return requestUrl.toString();
    } catch {
      return url;
    }
  }

  createAbortTimeout(timeoutMs) {
    if (timeoutMs == null || timeoutMs <= 0 || typeof AbortController === "undefined") {
      return {};
    }

    const controller = new AbortController();
    let timedOut = false;
    const timeoutId = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, timeoutMs);

    return {
      signal: controller.signal,
      clear: () => clearTimeout(timeoutId),
      timedOut: () => timedOut,
    };
  }

  httpErrorFromResponse(response) {
    const error = new Error(`Fetch failed with HTTP status ${response.status}`);
    error.name = "HttpError";
    return error;
  }

  shouldCaptureFetchFailure(sampleRate) {
    return sampleRate >= 1 || Math.random() < sampleRate;
  }

  async fetchResult(url, {
    method = "GET",
    setLoader,
    parseJson = true,
    captureContext = {},
    captureFailureSampleRate = 1,
    retryDelayMs = SAFE_FETCH_RETRY_DELAY_MS,
    fetchTimeoutMs = FETCH_TIMEOUT_MS,
  } = {}) {
    const normalizedMethod = (method ?? "GET").toUpperCase();
    const maxAttempts = normalizedMethod === "GET" ? MAX_SAFE_FETCH_ATTEMPTS : 1;
    const requestUrl = this.urlWithIntegrationParams(url);
    const updateLoader = typeof setLoader === "function" ? setLoader : this.noop;

    updateLoader(true);

    try {
      for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
        const startedAt = this.getTimeStamp();
        let phase = "fetch";
        let rawResult = null;
        let abortTimeout = {};

        try {
          abortTimeout = this.createAbortTimeout(fetchTimeoutMs);
          rawResult = await fetch(requestUrl, {
            method: normalizedMethod,
            redirect: "follow",
            cache: "no-cache",
            signal: abortTimeout.signal,
            headers: {
              Accept: "application/json",
            }
          });

          if (rawResult?.ok === false) {
            phase = "http_status";
            throw this.httpErrorFromResponse(rawResult);
          }

          if (parseJson) {
            phase = "parse_json";
            return await rawResult.json();
          }

          phase = "read_body";
          return rawResult.body;
        } catch (error) {
          if (
            attempt < maxAttempts &&
            this.retryableFetchFailure({ method: normalizedMethod, phase, response: rawResult })
          ) {
            await this.wait(retryDelayMs);
            continue;
          }

          if (this.shouldCaptureFetchFailure(captureFailureSampleRate)) {
            const context = buildFetchFailureContext(requestUrl, {
              method: normalizedMethod,
              parseJson,
              phase,
              startedAt,
              endedAt: this.getTimeStamp(),
              error,
              response: rawResult,
              attempt,
              retried: attempt > 1,
              timeoutMs: fetchTimeoutMs,
              timedOut: abortTimeout.timedOut?.(),
            });

            this.captureException(error, mergeCaptureContext(context, captureContext));
          }

          return null;
        } finally {
          abortTimeout.clear?.();
        }
      }

      return null;
    } finally {
      updateLoader(false);
    }
  }
}
