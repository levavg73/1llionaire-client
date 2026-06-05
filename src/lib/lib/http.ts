const rawBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";
const baseURL = rawBaseUrl.replace(/\/+$/, "");

const DEFAULT_TIMEOUT_MS = 75000;

type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

export type QueryValue = string | number | boolean | null | undefined;
export type QueryParams = Record<string, QueryValue | QueryValue[]>;

interface RequestConfig {
  method: HttpMethod;
  url: string;
  params?: QueryParams;
  data?: unknown;
}

export interface HttpResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
  config: RequestConfig;
}

export class ApiError<T = unknown> extends Error {
  response?: HttpResponse<T>;
  config?: RequestConfig;
  status?: number;

  constructor(message: string, options?: { response?: HttpResponse<T>; config?: RequestConfig }) {
    super(message);
    this.name = "ApiError";
    this.response = options?.response;
    this.config = options?.config;
    this.status = options?.response?.status;
  }
}

export function toQueryParams(params?: Record<string, unknown>): QueryParams | undefined {
  if (!params) return undefined;

  const result: QueryParams = {};

  Object.entries(params).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      const values = value.filter(isQueryValue);
      if (values.length > 0) result[key] = values;
      return;
    }

    if (isQueryValue(value)) {
      result[key] = value;
    }
  });

  return Object.keys(result).length > 0 ? result : undefined;
}

function isQueryValue(value: unknown): value is QueryValue {
  return (
    value === null ||
    value === undefined ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  );
}

function buildUrl(path: string, params?: QueryParams) {
  if (/^(https?:)?\/\//i.test(path)) {
    throw new ApiError("Absolute URLs are not allowed for API requests.", {
      config: { method: "GET", url: path },
    });
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${baseURL}${normalizedPath}`);

  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item !== undefined && item !== null) {
          url.searchParams.append(key, String(item));
        }
      });
      return;
    }

    if (value !== undefined && value !== null) {
      url.searchParams.set(key, String(value));
    }
  });

  return url.toString();
}

let refreshPromise: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = fetch(buildUrl("/api/auth/refresh"), {
      method: "POST",
      credentials: "include",
    })
      .then((res) => res.ok)
      .catch(() => false)
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

function shouldTryRefresh(config: RequestConfig, status: number): boolean {
  if (status !== 401 || typeof window === "undefined") return false;

  const authRefreshExcluded =
    config.url.includes("/api/auth/login") ||
    config.url.includes("/api/auth/signup") ||
    config.url.includes("/api/auth/logout") ||
    config.url.includes("/api/auth/refresh");

  return !authRefreshExcluded && !(config as RequestConfig & { _retried?: boolean })._retried;
}

async function parseResponseBody(response: Response) {
  if (response.status === 204) return null;

  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
}

function getErrorMessage(data: unknown) {
  if (
    typeof data === "object" &&
    data !== null &&
    "error" in data &&
    typeof (data as { error?: { message?: unknown } }).error?.message === "string"
  ) {
    return (data as { error: { message: string } }).error.message;
  }

  if (
    typeof data === "object" &&
    data !== null &&
    "message" in data &&
    typeof (data as { message?: unknown }).message === "string"
  ) {
    return (data as { message: string }).message;
  }

  return "API request failed.";
}

async function request<T = unknown>(config: RequestConfig): Promise<HttpResponse<T>> {
  const controller = new AbortController();
  const timeoutId = globalThis.setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  const headers = new Headers({ Accept: "application/json" });
  let body: BodyInit | undefined;

  if (config.data instanceof FormData) {
    body = config.data;
  } else if (config.data !== undefined) {
    headers.set("Content-Type", "application/json");
    body = JSON.stringify(config.data);
  }

  try {
    const response = await fetch(buildUrl(config.url, config.params), {
      method: config.method,
      headers,
      body,
      credentials: "include",
      signal: controller.signal,
    });

    const data = (await parseResponseBody(response)) as T;

    const apiResponse: HttpResponse<T> = {
      data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      config,
    };

    if (!response.ok) {
      if (shouldTryRefresh(config, response.status)) {
        const refreshed = await refreshAccessToken();

        if (refreshed) {
          return request<T>({ ...config, _retried: true } as RequestConfig);
        }

        window.dispatchEvent(new Event("auth:unauthorized"));
      }

      throw new ApiError(getErrorMessage(data), {
        response: apiResponse,
        config,
      });
    }

    return apiResponse;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiError("API request timed out.", { config });
    }

    throw new ApiError(error instanceof Error ? error.message : "API request failed.", {
      config,
    });
  } finally {
    globalThis.clearTimeout(timeoutId);
  }
}

const http = {
  get: <T = unknown>(url: string, options?: { params?: QueryParams }) =>
    request<T>({ method: "GET", url, params: options?.params }),

  post: <T = unknown>(url: string, data?: unknown) =>
    request<T>({ method: "POST", url, data }),

  patch: <T = unknown>(url: string, data?: unknown) =>
    request<T>({ method: "PATCH", url, data }),

  // body가 있는 DELETE도 지원 (회원 탈퇴 등)
  delete: <T = unknown>(url: string, data?: unknown) =>
    request<T>({ method: "DELETE", url, data }),
};

export default http;
