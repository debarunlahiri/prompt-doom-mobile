import { AxiosInstance, InternalAxiosRequestConfig } from "axios";

type TimedRequestConfig = InternalAxiosRequestConfig & {
  networkStartedAt?: number;
};

const sensitiveKeys = new Set([
  "authorization",
  "accesstoken",
  "refreshtoken",
  "password",
  "token",
  "resettoken",
]);

function sanitize(value: unknown, seen = new WeakSet<object>()): unknown {
  if (value === null || value === undefined) return value;
  if (typeof value !== "object") return value;
  if (seen.has(value)) return "[Circular]";
  seen.add(value);

  if (Array.isArray(value)) {
    return value.map((item) => sanitize(item, seen));
  }

  if (typeof FormData !== "undefined" && value instanceof FormData) {
    return "[FormData]";
  }

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, item]) => [
      key,
      sensitiveKeys.has(key.toLowerCase())
        ? "[REDACTED]"
        : sanitize(item, seen),
    ]),
  );
}

function duration(config?: TimedRequestConfig) {
  return config?.networkStartedAt
    ? `${Date.now() - config.networkStartedAt}ms`
    : "unknown";
}

function fullUrl(client: AxiosInstance, config?: TimedRequestConfig) {
  if (!config) return "unknown";

  try {
    return client.getUri(config);
  } catch {
    return `${config.baseURL ?? ""}${config.url ?? ""}`;
  }
}

export function attachNetworkLogger(client: AxiosInstance) {
  if (!__DEV__) return;

  client.interceptors.request.use((config: TimedRequestConfig) => {
    config.networkStartedAt = Date.now();
    console.log("🌐 API REQUEST", {
      method: config.method?.toUpperCase(),
      fullUrl: fullUrl(client, config),
      params: sanitize(config.params),
      headers: sanitize(config.headers),
      body: sanitize(config.data),
    });
    return config;
  });

  client.interceptors.response.use(
    (response) => {
      const config = response.config as TimedRequestConfig;
      console.log("✅ API RESPONSE", {
        method: config.method?.toUpperCase(),
        fullUrl: fullUrl(client, config),
        status: response.status,
        duration: duration(config),
        headers: sanitize(response.headers),
        data: sanitize(response.data),
      });
      return response;
    },
    (error) => {
      const config = error.config as TimedRequestConfig | undefined;
      console.log("❌ API ERROR", {
        method: config?.method?.toUpperCase(),
        fullUrl: fullUrl(client, config),
        status: error.response?.status,
        duration: duration(config),
        code: error.code,
        message: error.message,
        requestParams: sanitize(config?.params),
        requestBody: sanitize(config?.data),
        responseHeaders: sanitize(error.response?.headers),
        responseData: sanitize(error.response?.data),
      });
      return Promise.reject(error);
    },
  );
}
