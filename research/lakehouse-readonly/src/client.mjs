/**
 * Read-only Wolfsonian Lakehouse client.
 * Separate from src/wolfsonian-api.mjs (digital.wolfsonian.org / Turnstile era).
 */

export const DEFAULT_BASE = 'https://lakehouse.wolfsonian.org';
export const DEFAULT_MIN_DELAY_MS = 900;
export const DEFAULT_MAX_REQUESTS = 12;
export const DEFAULT_TIMEOUT_MS = 20_000;

export class LakehouseError extends Error {
  /**
   * @param {string} layer DNS|TLS|fetch|HTTP|JSON|schema|record_identity|rate_limit
   * @param {string} message
   * @param {Record<string, unknown>} [details]
   */
  constructor(layer, message, details = {}) {
    super(message);
    this.name = 'LakehouseError';
    this.layer = layer;
    this.details = details;
  }
}

/**
 * @typedef {object} LakehouseResult
 * @property {object} query
 * @property {number|null} status
 * @property {string} retrievedAt
 * @property {unknown} raw
 * @property {{ verified: boolean, contentType: string|null, reason?: string }} validation
 * @property {{ layer: string, message: string, details?: object }|null} error
 */

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * @param {object} [options]
 */
export function createLakehouseClient(options = {}) {
  const baseUrl = String(options.baseUrl || DEFAULT_BASE).replace(/\/$/, '');
  const minDelayMs = Number(options.minDelayMs ?? DEFAULT_MIN_DELAY_MS);
  const maxRequests = Number(options.maxRequests ?? DEFAULT_MAX_REQUESTS);
  const timeoutMs = Number(options.timeoutMs ?? DEFAULT_TIMEOUT_MS);
  const fetchImpl = options.fetchImpl || globalThis.fetch;
  let requestCount = 0;
  let lastRequestAt = 0;

  if (typeof fetchImpl !== 'function') {
    throw new LakehouseError('fetch', 'fetch is not available in this runtime');
  }

  async function throttle() {
    if (requestCount >= maxRequests) {
      throw new LakehouseError('rate_limit', `Max requests per run exceeded (${maxRequests})`, {
        requestCount,
        maxRequests,
      });
    }
    const elapsed = Date.now() - lastRequestAt;
    if (lastRequestAt && elapsed < minDelayMs) {
      await sleep(minDelayMs - elapsed);
    }
  }

  /**
   * @param {string} pathOrUrl
   * @param {Record<string, string|number|undefined>} [params]
   * @returns {Promise<LakehouseResult>}
   */
  async function request(pathOrUrl, params = {}) {
    await throttle();
    const retrievedAt = new Date().toISOString();
    let url;
    try {
      url = pathOrUrl.startsWith('http')
        ? new URL(pathOrUrl)
        : new URL(pathOrUrl, `${baseUrl}/`);
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null && value !== '') {
          url.searchParams.set(key, String(value));
        }
      }
    } catch (error) {
      return {
        query: { pathOrUrl, params },
        status: null,
        retrievedAt,
        raw: null,
        validation: { verified: false, contentType: null, reason: 'invalid_url' },
        error: { layer: 'fetch', message: String(error), details: {} },
      };
    }

    const query = { url: url.toString(), method: 'GET' };
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      requestCount += 1;
      lastRequestAt = Date.now();
      const response = await fetchImpl(url, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });
      const contentType = response.headers.get('content-type');
      const text = await response.text();

      if (response.status === 429) {
        return {
          query,
          status: 429,
          retrievedAt,
          raw: text.slice(0, 500),
          validation: { verified: false, contentType, reason: 'rate_limited' },
          error: {
            layer: 'rate_limit',
            message: 'HTTP 429 — stop/backoff; do not retry in this run',
            details: { retryAfter: response.headers.get('retry-after') },
          },
        };
      }

      let raw = text;
      let jsonError = null;
      const looksJson = (contentType || '').includes('application/json') || /^\s*[\[{]/.test(text);
      if (looksJson && text) {
        try {
          raw = JSON.parse(text);
        } catch (error) {
          jsonError = String(error);
        }
      }

      const verified =
        response.status === 200 &&
        !jsonError &&
        typeof raw === 'object' &&
        raw !== null &&
        (contentType || '').includes('application/json');

      /** @type {LakehouseResult} */
      const result = {
        query,
        status: response.status,
        retrievedAt,
        raw: verified ? raw : typeof raw === 'string' ? raw.slice(0, 500) : raw,
        validation: {
          verified,
          contentType,
          reason: verified
            ? 'http_200_json'
            : response.status === 403 && String(text).includes('IP not authorized')
              ? 'http_403_ip_not_authorized'
              : jsonError
                ? 'json_parse_failed'
                : response.status === 200
                  ? 'not_json'
                  : 'http_error',
        },
        error: null,
      };

      if (!verified) {
        let layer = 'HTTP';
        if (jsonError) layer = 'JSON';
        if (response.status === 403 && String(text).includes('IP not authorized')) layer = 'HTTP';
        result.error = {
          layer,
          message: jsonError || `HTTP ${response.status}`,
          details: {
            bodyPreview: typeof text === 'string' ? text.slice(0, 200) : null,
          },
        };
      }

      return result;
    } catch (error) {
      const message = String(error?.message || error);
      let layer = 'fetch';
      if (/ENOTFOUND|EAI_AGAIN|getaddrinfo/i.test(message)) layer = 'DNS';
      else if (/CERT|SSL|TLS/i.test(message)) layer = 'TLS';
      else if (/abort/i.test(message)) layer = 'fetch';
      return {
        query,
        status: null,
        retrievedAt,
        raw: null,
        validation: { verified: false, contentType: null, reason: 'network_failure' },
        error: { layer, message, details: {} },
      };
    } finally {
      clearTimeout(timer);
    }
  }

  return {
    get requestCount() {
      return requestCount;
    },
    getBaseUrl: () => baseUrl,
    /** Health / schema discovery probe */
    probeRecords(limit = 1, offset = 0) {
      return request('/api/v1/records', { limit, offset });
    },
    getRecord(identifier) {
      if (!identifier || !String(identifier).trim()) {
        throw new LakehouseError('record_identity', 'identifier is required');
      }
      return request(`/api/v1/records/${encodeURIComponent(String(identifier).trim())}`);
    },
    search(q) {
      if (!q || !String(q).trim()) {
        throw new LakehouseError('record_identity', 'search query is required');
      }
      return request('/api/v1/search', { q: String(q).trim() });
    },
  };
}

/**
 * Label match quality without inventing identity.
 * @param {LakehouseResult} exactResult
 * @param {LakehouseResult|null} searchResult
 */
export function classifyAnchorMatch(exactResult, searchResult = null) {
  if (!exactResult) return 'CONNECTION FAILED';
  if (exactResult.validation?.reason === 'http_403_ip_not_authorized') return 'CONNECTION FAILED';
  if (exactResult.error?.layer === 'DNS' || exactResult.error?.layer === 'TLS') {
    return 'CONNECTION FAILED';
  }
  if (exactResult.error?.layer === 'fetch' && exactResult.status == null) {
    return 'CONNECTION FAILED';
  }
  if (exactResult.validation?.verified && exactResult.status === 200) {
    return 'VERIFIED MATCH';
  }
  if (exactResult.status === 404) {
    if (searchResult?.validation?.verified) return 'POSSIBLE MATCH';
    return 'NO MATCH';
  }
  if (exactResult.status === 403 || exactResult.status === 429) return 'CONNECTION FAILED';
  if (searchResult?.validation?.verified) return 'POSSIBLE MATCH';
  return 'CONNECTION FAILED';
}
