export function compactObject(object) {
  return Object.fromEntries(
    Object.entries(object).filter(([, value]) => value !== undefined),
  );
}

export function mergeCaptureContext(baseContext = {}, overrideContext = {}) {
  const {
    extra: baseExtra = {},
    tags: baseTags = {},
    contexts: baseContexts = {},
    ...baseRest
  } = baseContext || {};
  const {
    extra = {},
    tags = {},
    contexts = {},
    ...rest
  } = overrideContext || {};

  return {
    ...baseRest,
    ...rest,
    extra: compactObject({
      ...baseExtra,
      ...extra,
    }),
    tags: compactObject({
      ...baseTags,
      ...tags,
    }),
    contexts: {
      ...baseContexts,
      ...contexts,
    },
  };
}

export function sanitizedUrl(urlString) {
  try {
    const url = new URL(urlString);

    return `${url.origin}${url.pathname}`;
  } catch {
    return undefined;
  }
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
      url_integration_type: url.searchParams.get("integration_type") || undefined,
      url_integration_version: url.searchParams.get("integration_version") || undefined,
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

export function documentVisibilityContext() {
  if (typeof document === "undefined") {
    return {
      document_visibility_source: "no_document",
      document_visibility_state: "unsupported",
      document_hidden: "unsupported",
    };
  }

  if (document.visibilityState != null) {
    return {
      document_visibility_source: "visibility_state",
      document_visibility_state: document.visibilityState,
      document_hidden: document.hidden ?? "unsupported",
    };
  }

  if (document.hidden != null) {
    return {
      document_visibility_source: "hidden_flag",
      document_visibility_state: "unsupported",
      document_hidden: document.hidden,
    };
  }

  return {
    document_visibility_source: "unsupported",
    document_visibility_state: "unsupported",
    document_hidden: "unsupported",
  };
}

export function documentIsVisible(visibilityContext = documentVisibilityContext()) {
  if (visibilityContext.document_visibility_source === "visibility_state") {
    return visibilityContext.document_visibility_state === "visible";
  }

  if (visibilityContext.document_visibility_source === "hidden_flag") {
    return visibilityContext.document_hidden === false;
  }

  return undefined;
}

export function isLikelyFetchTeardown({ phase, response, timedOut, visibilityContext } = {}) {
  const visible = documentIsVisible(visibilityContext);

  if (visible == null) {
    return undefined;
  }

  return (
    phase === "fetch" &&
    response == null &&
    timedOut !== true &&
    visible === false
  );
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
  const {
    method,
    parseJson,
    phase,
    startedAt,
    endedAt,
    error,
    response,
    timeoutMs,
    timedOut,
    visibilityContext = documentVisibilityContext(),
    likelyTeardown,
  } = options;
  const elapsedMs = startedAt == null || endedAt == null ? undefined : endedAt - startedAt;

  try {
    const requestContext = requestUrlContext(url);
    const runtimeContext = navigatorContext();
    const documentVisible = documentIsVisible(visibilityContext);
    const responseContext = compactObject({
      response_status: response?.status,
      response_status_text: response?.statusText,
      response_url: sanitizedUrl(response?.url),
      response_type: response?.type,
      response_redirected: response?.redirected,
    });
    const extra = compactObject({
      url: sanitizedUrl(url),
      method,
      parse_json: parseJson,
      request_phase: phase,
      request_elapsed_ms: elapsedMs,
      request_timeout_ms: timeoutMs,
      request_timed_out: timedOut,
      request_document_visible: documentVisible,
      request_likely_teardown: likelyTeardown,
      ...requestContext,
      ...responseContext,
      ...errorContext(error),
      ...runtimeContext,
      ...visibilityContext,
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
        "uptick.request_timed_out": timedOut == null ? undefined : String(timedOut),
        "uptick.document_visibility_source": visibilityContext.document_visibility_source,
        "uptick.document_visibility_state": visibilityContext.document_visibility_state,
        "uptick.request_document_visible": documentVisible == null ? undefined : String(documentVisible),
        "uptick.request_likely_teardown": likelyTeardown == null ? undefined : String(likelyTeardown),
      }),
      contexts: {
        fetch_request: compactObject({
          method,
          parse_json: parseJson,
          phase,
          elapsed_ms: elapsedMs,
          timeout_ms: timeoutMs,
          timed_out: timedOut,
          document_visible: documentVisible,
          likely_teardown: likelyTeardown,
          ...requestContext,
        }),
        fetch_runtime: {
          ...runtimeContext,
          ...visibilityContext,
        },
        fetch_response: responseContext,
      },
    };
  } catch (contextError) {
    return {
      message: "Fetch failed:",
      extra: compactObject({
        url: sanitizedUrl(url),
        method,
        parse_json: parseJson,
        request_phase: phase,
        request_elapsed_ms: elapsedMs,
        request_timeout_ms: timeoutMs,
        request_timed_out: timedOut,
        request_likely_teardown: likelyTeardown,
        ...visibilityContext,
        fetch_context_error_name: contextError?.name,
        fetch_context_error_message: contextError?.message,
      }),
      tags: compactObject({
        "uptick.request_phase": phase,
        "uptick.fetch_context_error": contextError?.name || typeof contextError,
        "uptick.request_timed_out": timedOut == null ? undefined : String(timedOut),
        "uptick.document_visibility_source": visibilityContext.document_visibility_source,
        "uptick.document_visibility_state": visibilityContext.document_visibility_state,
        "uptick.request_likely_teardown": likelyTeardown == null ? undefined : String(likelyTeardown),
      }),
      contexts: {
        fetch_request: compactObject({
          method,
          parse_json: parseJson,
          phase,
          elapsed_ms: elapsedMs,
          timeout_ms: timeoutMs,
          timed_out: timedOut,
          likely_teardown: likelyTeardown,
        }),
        fetch_runtime: compactObject({
          ...visibilityContext,
        }),
        fetch_context_error: compactObject({
          name: contextError?.name,
          message: contextError?.message,
        }),
      },
    };
  }
}
