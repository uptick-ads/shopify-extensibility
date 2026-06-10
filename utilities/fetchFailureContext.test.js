import {
  afterEach,
  describe,
  expect,
  test,
} from "@jest/globals";
import {
  buildFetchFailureContext,
  errorContext,
  inferRequestType,
  mergeCaptureContext,
  navigatorContext,
  requestUrlContext,
} from "./fetchFailureContext";

const originalNavigator = global.navigator;

afterEach(() => {
  global.navigator = originalNavigator;
});

describe("mergeCaptureContext", () => {
  test("merges top-level context and Sentry data bags", () => {
    expect(mergeCaptureContext(
      {
        message: "Fetch failed:",
        extra: {
          method: "GET",
          request_type: "offer",
        },
        tags: {
          "uptick.request_type": "offer",
        },
        contexts: {
          fetch_request: {
            method: "GET",
          },
        },
      },
      {
        level: "warning",
        extra: {
          non_blocking: true,
        },
        tags: {
          "uptick.request_importance": "telemetry",
        },
      },
    )).toStrictEqual({
      message: "Fetch failed:",
      level: "warning",
      extra: {
        method: "GET",
        request_type: "offer",
        non_blocking: true,
      },
      tags: {
        "uptick.request_type": "offer",
        "uptick.request_importance": "telemetry",
      },
      contexts: {
        fetch_request: {
          method: "GET",
        },
      },
    });
  });

  test("replaces named contexts instead of deep merging them", () => {
    expect(mergeCaptureContext(
      {
        contexts: {
          fetch_request: {
            method: "GET",
            phase: "fetch",
          },
        },
      },
      {
        contexts: {
          fetch_request: {
            purpose: "override",
          },
        },
      },
    ).contexts.fetch_request).toStrictEqual({
      purpose: "override",
    });
  });
});

describe("inferRequestType", () => {
  test("classifies request type from URL path", () => {
    expect(inferRequestType(new URL("https://api.uptick.com/places/flows/shopify"))).toBe("initial_flow");
    expect(inferRequestType(new URL("https://api.uptick.com/places/place-id/flows/new"))).toBe("initial_flow");
    expect(inferRequestType(new URL("https://api.uptick.com/v1/places/place-id/flows/flow-id/offers"))).toBe("offer");
    expect(inferRequestType(new URL("https://api.uptick.com/v1/places/place-id/flows/flow-id/offers/new"))).toBe("offer");
    expect(inferRequestType(new URL("https://api.uptick.com/v1/places/place-id/flows/flow-id/events"))).toBe("offer_event");
    expect(inferRequestType(new URL("https://api.uptick.com/health"))).toBe("unknown");
  });
});

describe("requestUrlContext", () => {
  test("extracts query and path context", () => {
    expect(requestUrlContext(
      "https://api.uptick.com/places/flows/shopify?placement=order_status&shop_myshopify_domain=shop.myshopify.com&no_redirect=1",
    )).toStrictEqual({
      request_type: "initial_flow",
      url_origin: "https://api.uptick.com",
      url_host: "api.uptick.com",
      url_path: "/places/flows/shopify",
      url_placement: "order_status",
      url_shop_myshopify_domain: "shop.myshopify.com",
      url_no_redirect: "1",
    });
  });

  test("classifies invalid URLs without throwing", () => {
    expect(requestUrlContext("not a url")).toStrictEqual({
      request_type: "invalid_url",
    });
  });
});

describe("errorContext", () => {
  test("does not duplicate parsed exception stack", () => {
    const error = new Error("Network failure");
    const context = errorContext(error);

    expect(context.error_name).toBe("Error");
    expect(context.error_message).toBe("Network failure");
    expect(context.error_stack).toBeUndefined();
  });
});

describe("navigatorContext", () => {
  test("returns an empty object when navigator is unavailable", () => {
    delete global.navigator;

    expect(navigatorContext()).toStrictEqual({});
  });

  test("adds navigator network context when available", () => {
    global.navigator = {
      connection: {
        downlink: 10,
        effectiveType: "4g",
        rtt: 50,
        saveData: false,
      },
      language: "en-US",
      onLine: true,
      userAgent: "Chrome",
    };

    expect(navigatorContext()).toStrictEqual({
      navigator_language: "en-US",
      navigator_online: true,
      navigator_user_agent: "Chrome",
      network_downlink: 10,
      network_effective_type: "4g",
      network_rtt: 50,
      network_save_data: false,
    });
  });
});

describe("buildFetchFailureContext", () => {
  test("builds capture context for fetch failures", () => {
    delete global.navigator;

    const context = buildFetchFailureContext(
      "https://www.test.com/offers/new?first_name=Hidden&zip=12345&integration_type=shopify_extensibility&integration_version=1.1.0",
      {
        method: "POST",
        parseJson: true,
        phase: "parse_json",
        startedAt: 1000,
        endedAt: 1250,
        error: "failed",
        response: {
          status: 500,
          statusText: "Server Error",
          url: "https://www.test.com/offers/new?first_name=Hidden&zip=12345",
        },
        attempt: 2,
        retried: true,
        timeoutMs: 8000,
        timedOut: false,
      },
    );

    expect(context).toStrictEqual({
      message: "Fetch failed:",
      extra: {
        url: "https://www.test.com/offers/new",
        method: "POST",
        parse_json: true,
        request_phase: "parse_json",
        request_elapsed_ms: 250,
        request_attempts: 2,
        request_retried: true,
        request_timeout_ms: 8000,
        request_timed_out: false,
        request_type: "offer",
        response_status: 500,
        response_status_text: "Server Error",
        response_url: "https://www.test.com/offers/new",
        url_origin: "https://www.test.com",
        url_host: "www.test.com",
        url_path: "/offers/new",
        url_integration_type: "shopify_extensibility",
        url_integration_version: "1.1.0",
      },
      tags: {
        "uptick.request_type": "offer",
        "uptick.request_phase": "parse_json",
        "uptick.fetch_host": "www.test.com",
        "uptick.fetch_error": "string",
        "uptick.request_retried": "true",
        "uptick.request_timed_out": "false",
      },
      contexts: {
        fetch_request: {
          method: "POST",
          parse_json: true,
          phase: "parse_json",
          elapsed_ms: 250,
          attempts: 2,
          retried: true,
          timeout_ms: 8000,
          timed_out: false,
          request_type: "offer",
          url_origin: "https://www.test.com",
          url_host: "www.test.com",
          url_path: "/offers/new",
          url_integration_type: "shopify_extensibility",
          url_integration_version: "1.1.0",
        },
        fetch_runtime: {},
        fetch_response: {
          response_status: 500,
          response_status_text: "Server Error",
          response_url: "https://www.test.com/offers/new",
        },
      },
    });
    expect(JSON.stringify(context)).not.toContain("Hidden");
    expect(JSON.stringify(context)).not.toContain("12345");
  });
});
