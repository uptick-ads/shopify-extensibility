export function compactObject(object) {
  return Object.fromEntries(
    Object.entries(object).filter(([, value]) => value !== undefined),
  );
}

export function inferRequestType(url) {
  const pathParts = url.pathname.split("/").filter(Boolean);

  if (pathParts.includes("events")) {
    return "offer_event";
  }

  if (pathParts.includes("offers")) {
    return "offer";
  }

  const flowIndex = pathParts.indexOf("flows");
  if (flowIndex !== -1 && ["shopify", "new"].includes(pathParts[flowIndex + 1])) {
    return "initial_flow";
  }

  return "unknown";
}

export function requestUrlContext(urlString) {
  try {
    const url = new URL(urlString);

    return compactObject({
      request_type: inferRequestType(url),
      url_origin: url.origin,
      url_host: url.hostname,
      url_path: url.pathname,
      url_placement: url.searchParams.get("placement") || undefined,
      url_shop_myshopify_domain: url.searchParams.get("shop_myshopify_domain") || undefined,
      url_no_redirect: url.searchParams.get("no_redirect") || undefined,
    });
  } catch {
    return {
      request_type: "invalid_url",
    };
  }
}

export function errorContext(error) {
  return compactObject({
    error_name: error?.name,
    error_message: error?.message,
    error_cause: error?.cause?.message || error?.cause,
  });
}

export function navigatorContext() {
  if (typeof navigator === "undefined") {
    return {};
  }

  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

  return compactObject({
    navigator_online: navigator.onLine,
    navigator_language: navigator.language,
    navigator_user_agent: navigator.userAgent,
    network_effective_type: connection?.effectiveType,
    network_downlink: connection?.downlink,
    network_rtt: connection?.rtt,
    network_save_data: connection?.saveData,
  });
}

export function buildFetchFailureContext(url, options = {}) {
  const { method, parseJson, phase, startedAt, endedAt, error, response } = options;
  const elapsedMs = startedAt == null || endedAt == null ? undefined : endedAt - startedAt;

  try {
    const requestContext = requestUrlContext(url);
    const runtimeContext = navigatorContext();
    const responseContext = compactObject({
      response_status: response?.status,
      response_status_text: response?.statusText,
      response_url: response?.url,
      response_type: response?.type,
      response_redirected: response?.redirected,
    });
    const extra = compactObject({
      url,
      method,
      parse_json: parseJson,
      request_phase: phase,
      request_elapsed_ms: elapsedMs,
      ...requestContext,
      ...responseContext,
      ...errorContext(error),
      ...runtimeContext,
    });

    return {
      message: "Fetch failed:",
      extra,
      tags: compactObject({
        "uptick.request_type": requestContext.request_type,
        "uptick.request_phase": phase,
        "uptick.fetch_host": requestContext.url_host,
        "uptick.fetch_error": error?.name || typeof error,
        "uptick.navigator_online": runtimeContext.navigator_online == null ? undefined : String(runtimeContext.navigator_online),
      }),
      contexts: {
        fetch_request: compactObject({
          method,
          parse_json: parseJson,
          phase,
          elapsed_ms: elapsedMs,
          ...requestContext,
        }),
        fetch_runtime: runtimeContext,
        fetch_response: responseContext,
      },
    };
  } catch (contextError) {
    return {
      message: "Fetch failed:",
      extra: compactObject({
        url,
        method,
        parse_json: parseJson,
        request_phase: phase,
        request_elapsed_ms: elapsedMs,
        fetch_context_error_name: contextError?.name,
        fetch_context_error_message: contextError?.message,
      }),
      tags: compactObject({
        "uptick.request_phase": phase,
        "uptick.fetch_context_error": contextError?.name || typeof contextError,
      }),
      contexts: {
        fetch_request: compactObject({
          method,
          parse_json: parseJson,
          phase,
          elapsed_ms: elapsedMs,
        }),
        fetch_context_error: compactObject({
          name: contextError?.name,
          message: contextError?.message,
        }),
      },
    };
  }
}
