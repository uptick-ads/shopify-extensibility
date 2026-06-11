import { isEmpty, isPresent } from "../utilities/present.js";
import {
  buildFetchFailureContext,
  documentVisibilityContext,
  isLikelyFetchTeardown,
  mergeCaptureContext,
} from "../utilities/fetchFailureContext.js";

const MAX_REDIRECTS = 3;
const OFFER_VIEWED_CAPTURE_SAMPLE_RATE = 0.1;
const FETCH_TIMEOUT_MS = 8000;
const INTEGRATION_TYPE = "shopify_extensibility";
const INTEGRATION_VERSION = "1.1.0";
const EXPECTED_EMPTY_RESULT_HTTP_STATUSES = new Set([403, 410, 422]);
const EXPECTED_EMPTY_RESULT_ERROR_CODES = new Set([
  "placement_disabled",
  "site_blocked",
  "flow_expired",
]);

export default class Api {
  constructor({
    integrationId = null,
    captureWarning = null,
    captureException = null,
    fetchFunction = null,
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
    this.fetchFunction = fetchFunction || ((...args) => fetch(...args));
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
      const [flow, flowContext] = await this.fetchResult(url.toString(), { setLoader: this.noop });
      this.flow = flow;
      if (this.handleFetchResultContext(flowContext)) {
        return false;
      }

      // Handle no_redirect response — follow flow_url if present
      if (isPresent(this.flow?.flow_url)) {
        const flowUrl = this.flow.flow_url;
        const [redirectFlow, redirectFlowContext] = await this.fetchResult(flowUrl, { setLoader: this.noop });
        this.flow = redirectFlow;
        if (this.handleFetchResultContext(redirectFlowContext)) {
          return false;
        }

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

  /**
   * @private Internal offer-fetch implementation. Public callers should use getInitialOffer/getNextOffer.
   */
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

    const fetchOptions = { method, setLoader };

    const [offerResult, offerContext] = await this.fetchResult(url.toString(), fetchOptions);
    if (this.handleFetchResultContext(offerContext)) {
      return false;
    }

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

  /**
   * @private Fire-and-forget telemetry helper used by getOfferBase.
   */
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

      const [result] = await this.fetchResult(url.toString(), {
        method: "POST",
        setLoader: this.noop,
        parseJson: false,
        captureContext: telemetryCaptureContext,
        captureFailureSampleRate: OFFER_VIEWED_CAPTURE_SAMPLE_RATE,
      });
      return result;
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

  /**
   * @private Current timestamp wrapper for tests and request telemetry.
   */
  getTimeStamp() {
    return new Date().getTime();
  }

  /**
   * @private Adds configured integration options to API request URLs.
   */
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

  /**
   * @private Safely adds a non-empty query parameter to a request URL.
   */
  addParam(url, value, query_param_key) {
    try {
      if (isPresent(value)) {
        url.searchParams.set(query_param_key, value);
      }
    } catch (error) {
      this.captureException(error, { extra: { message: "Unable to set shop api key", query_param_key, value } });
    }
  }

  /**
   * @private Adds integration identifiers as query params to avoid CORS preflight headers.
   */
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

  /**
   * @private Builds an abort signal wrapper for request timeouts.
   */
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

  /**
   * @private Converts a non-ok HTTP response into the error captured by Sentry.
   */
  httpErrorFromResponse(response) {
    const error = new Error(`Fetch failed with HTTP status ${response.status}`);
    error.name = "HttpError";
    return error;
  }

  /**
   * @private Extracts structured metadata from known non-ok response bodies.
   */
  async fetchResultContextFromResponse(response) {
    if (
      response?.ok !== false ||
      !EXPECTED_EMPTY_RESULT_HTTP_STATUSES.has(response.status) ||
      typeof response.json !== "function"
    ) {
      return {};
    }

    try {
      const body = await response.json();

      return {
        code: body?.errors?.[0]?.code,
        title: body?.errors?.[0]?.title,
        responseStatus: response.status,
      };
    } catch {
      return {};
    }
  }

  /**
   * @private Indicates whether a non-ok response is an expected empty API result.
   */
  isExpectedEmptyFetchResult(context) {
    return EXPECTED_EMPTY_RESULT_ERROR_CODES.has(context?.code);
  }

  /**
   * @private Indicates whether fetchResult should capture this result as an error.
   */
  shouldCaptureFetchResult(context) {
    return !this.isExpectedEmptyFetchResult(context);
  }

  /**
   * @private Returns the warning text for expected empty API responses.
   */
  fetchResultWarningMessage(context) {
    if (!this.isExpectedEmptyFetchResult(context)) {
      return null;
    }

    if (isPresent(context?.title) && isPresent(context?.code)) {
      return `${context.title} (${context.code}).`;
    }

    if (isPresent(context?.title)) {
      return context.title;
    }

    if (isPresent(context?.code)) {
      return `API returned expected empty result (${context.code}).`;
    }

    return null;
  }

  /**
   * @private Handles expected empty API responses. Returns true when callers should stop.
   */
  handleFetchResultContext(context) {
    if (this.shouldCaptureFetchResult(context)) {
      return false;
    }

    const warningMessage = this.fetchResultWarningMessage(context);
    if (isPresent(warningMessage)) {
      this.captureWarning(warningMessage);
    }

    return true;
  }

  /**
   * @private Samples low-priority fetch failures.
   */
  shouldCaptureFetchFailure(sampleRate) {
    return sampleRate >= 1 || Math.random() < sampleRate;
  }

  /**
   * @private Internal transport helper. Returns [result, context]; public callers should not use directly.
   */
  async fetchResult(url, {
    method = "GET",
    setLoader,
    parseJson = true,
    captureContext = {},
    captureFailureSampleRate = 1,
    fetchTimeoutMs = FETCH_TIMEOUT_MS,
    fetchFunction = this.fetchFunction,
  } = {}) {
    const normalizedMethod = (method ?? "GET").toUpperCase();
    const requestUrl = this.urlWithIntegrationParams(url);
    const updateLoader = typeof setLoader === "function" ? setLoader : this.noop;
    const startedAt = this.getTimeStamp();
    let phase = "fetch";
    let rawResult = null;
    let abortTimeout = {};

    updateLoader(true);

    try {
      abortTimeout = this.createAbortTimeout(fetchTimeoutMs);
      rawResult = await fetchFunction(requestUrl, {
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
        const responseContext = {
          ...await this.fetchResultContextFromResponse(rawResult),
          phase,
          responseStatus: rawResult.status,
        };

        if (!this.shouldCaptureFetchResult(responseContext)) {
          return [null, responseContext];
        }

        throw this.httpErrorFromResponse(rawResult);
      }

      if (parseJson) {
        phase = "parse_json";
        return [await rawResult.json(), {
          phase,
          responseStatus: rawResult?.status,
        }];
      }

      phase = "read_body";
      return [rawResult.body, {
        phase,
        responseStatus: rawResult?.status,
      }];
    } catch (error) {
      const timedOut = abortTimeout.timedOut?.();
      const visibilityContext = documentVisibilityContext();
      const likelyTeardown = isLikelyFetchTeardown({
        phase,
        response: rawResult,
        timedOut,
        visibilityContext,
      });

      let captured = false;

      if (likelyTeardown !== true && this.shouldCaptureFetchFailure(captureFailureSampleRate)) {
        const context = buildFetchFailureContext(requestUrl, {
          method: normalizedMethod,
          parseJson,
          phase,
          startedAt,
          endedAt: this.getTimeStamp(),
          error,
          response: rawResult,
          timeoutMs: fetchTimeoutMs,
          timedOut,
          visibilityContext,
          likelyTeardown,
        });

        this.captureException(error, mergeCaptureContext(context, captureContext));
        captured = true;
      }

      return [null, {
        captured,
        error,
        likelyTeardown,
        phase,
        responseStatus: rawResult?.status,
        timedOut,
      }];
    } finally {
      abortTimeout.clear?.();
      updateLoader(false);
    }
  }
}
