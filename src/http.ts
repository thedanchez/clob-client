import type { DropNotificationParams, OrdersScoringParams } from "./types";
import { isBrowser } from "./utilities";

export const GET = "GET";
export const POST = "POST";
export const DELETE = "DELETE";
export const PUT = "PUT";

type Method = "GET" | "POST" | "DELETE" | "PUT";
type RequestHeaders = Record<string, string>;

const overloadHeaders = (
  method: Method,
  headers: Record<string, string | number | boolean> = {},
) => {
  if (isBrowser()) return;

  headers["User-Agent"] = `@dschz/polymarket-clob-client`;
  headers["Accept"] = "*/*";
  headers["Connection"] = "keep-alive";
  headers["Content-Type"] = "application/json";

  if (method === "GET") {
    headers["Accept-Encoding"] = "gzip";
  }
};

export type QueryParams = Record<string, any>;

export type RequestOptions = {
  readonly headers?: RequestHeaders;
  readonly data?: any;
  readonly params?: QueryParams;
};

type RequestConfig = RequestOptions & {
  readonly url: string;
  readonly method: Method;
};

const appendQueryParams = (url: string, params: QueryParams = {}) => {
  const urlObj = new URL(url);

  Object.entries(params).forEach(([key, value]) => {
    urlObj.searchParams.set(key, value);
  });

  return urlObj.toString();
};

export const request = async (config: RequestConfig): Promise<any> => {
  const { url, method, headers, data, params } = config;

  overloadHeaders(method, headers);

  const endpoint = appendQueryParams(url, params);

  const fetchOptions: RequestInit = {
    method,
    headers: (headers as Record<string, string>) || {},
  };

  if (data && (method === "POST" || method === "PUT" || method === "DELETE")) {
    fetchOptions.body = JSON.stringify(data);
  }

  const response = await fetch(endpoint, fetchOptions);

  const responseData = response.headers.get("content-type")?.includes("application/json")
    ? await response.json()
    : await response.text();

  const result = {
    data: responseData,
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
    config: { method, url: endpoint, headers, data, params },
  };

  if (!response.ok) {
    throw result;
  }

  return result;
};

export const get = async (endpoint: string, options?: RequestOptions): Promise<any> => {
  try {
    const resp = await request({
      url: endpoint,
      method: "GET",
      headers: options?.headers,
      data: options?.data,
      params: options?.params,
    });

    return resp.data;
  } catch (err: unknown) {
    return errorHandling(err);
  }
};

export const post = async (endpoint: string, options?: RequestOptions): Promise<any> => {
  try {
    const resp = await request({
      url: endpoint,
      method: "POST",
      headers: options?.headers,
      data: options?.data,
      params: options?.params,
    });

    return resp.data;
  } catch (err: unknown) {
    return errorHandling(err);
  }
};

export const del = async (endpoint: string, options?: RequestOptions): Promise<any> => {
  try {
    const resp = await request({
      url: endpoint,
      method: "DELETE",
      headers: options?.headers,
      data: options?.data,
      params: options?.params,
    });
    return resp.data;
  } catch (err: unknown) {
    return errorHandling(err);
  }
};

const errorHandling = (err: unknown) => {
  if (err instanceof TypeError && err.message.includes("fetch")) {
    console.error(
      "[CLOB Client] request error",
      JSON.stringify({
        error: err.message,
      }),
    );
    return { error: err.message };
  }

  // Handle fetch Response errors (when response was received but not ok)
  if (err && typeof err === "object" && "status" in err) {
    const response = err as any;
    console.error(
      "[CLOB Client] request error",
      JSON.stringify({
        status: response.status,
        statusText: response.statusText,
        data: response.data,
        config: response.config,
      }),
    );
    if (response.data) {
      if (typeof response.data === "string" || response.data instanceof String) {
        return { error: response.data, status: response.status };
      }
      if (!Object.prototype.hasOwnProperty.call(response.data, "error")) {
        return { error: response.data, status: response.status };
      }
      // in this case the field 'error' is included
      return { ...response.data, status: response.status };
    }
  }

  if (err instanceof Error) {
    console.error(
      "[CLOB Client] request error",
      JSON.stringify({
        error: err.message,
      }),
    );
    return { error: err.message };
  }

  console.error("[CLOB Client] request error", err);
  return { error: err };
};

export const parseOrdersScoringParams = (orderScoringParams?: OrdersScoringParams): QueryParams => {
  const params: QueryParams = {};
  if (orderScoringParams !== undefined) {
    if (orderScoringParams.orderIds !== undefined) {
      params["order_ids"] = orderScoringParams?.orderIds.join(",");
    }
  }
  return params;
};

export const parseDropNotificationParams = (
  dropNotificationParams?: DropNotificationParams,
): QueryParams => {
  const params: QueryParams = {};
  if (dropNotificationParams !== undefined) {
    if (dropNotificationParams.ids !== undefined) {
      params["ids"] = dropNotificationParams?.ids.join(",");
    }
  }
  return params;
};
