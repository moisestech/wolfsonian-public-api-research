const DEFAULT_BASE = 'https://digital.wolfsonian.org';
const DEFAULT_TIMEOUT_MS = 20_000;

export const FIELD_CODES = Object.freeze({
  anywhere: 'ZZ',
  abstract: 'AB',
  accessionNumber: 'AN',
  aggregation: 'UA',
  subjects: 'SU',
  bibId: 'BI',
  city: 'CI',
  country: 'CO',
  county: 'CT',
  creator: 'AU',
  donor: 'DO',
  edition: 'ET',
  format: 'FO',
  frequency: 'FR',
  genre: 'GE',
  holdingLocation: 'HO',
  identifier: 'ID',
  includedFiles: 'MI',
  language: 'LA',
  material: 'MA',
  nameAsSubject: 'SN',
  notes: 'NO',
  publicationDate: 'DA',
  publicationPlace: 'PP',
  publisher: 'PU',
  sourceInstitution: 'SO',
  spatialCoverage: 'SP',
  state: 'ST',
  subjectKeyword: 'TO',
  targetAudience: 'TA',
  temporalYear: 'DY',
  title: 'TI',
  titleAsSubject: 'TS',
  tableOfContents: 'TC',
  type: 'TY'
});

export class WolfsonianApiError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = 'WolfsonianApiError';
    this.details = details;
  }
}

function getConfig(overrides = {}) {
  return {
    baseUrl: overrides.baseUrl || process.env.WOLFSONIAN_API_BASE || DEFAULT_BASE,
    timeoutMs: Number(overrides.timeoutMs || process.env.WOLFSONIAN_TIMEOUT_MS || DEFAULT_TIMEOUT_MS),
    cookie: overrides.cookie || process.env.WOLFSONIAN_COOKIE || ''
  };
}

function makeUrl(pathname, params = {}, overrides = {}) {
  const { baseUrl } = getConfig(overrides);
  const url = new URL(pathname, baseUrl);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  }
  return url;
}

export function buildSearchUrl({ query, page = 1, field = 'ZZ', format = 'json' }, overrides = {}) {
  if (!query || !String(query).trim()) throw new TypeError('query is required');
  return makeUrl(`/engine/search/results/${format}`, { t: query, p: page, f: field }, overrides);
}

export function buildSearchStatsUrl({ query, field = 'ZZ', format = 'json' }, overrides = {}) {
  if (!query || !String(query).trim()) throw new TypeError('query is required');
  return makeUrl(`/engine/search/stats/${format}`, { t: query, f: field }, overrides);
}

export function buildCitationUrl(bibId, format = 'json', overrides = {}) {
  if (!bibId || !String(bibId).trim()) throw new TypeError('bibId is required');
  return makeUrl(`/engine/items/citation/${format}/${encodeURIComponent(String(bibId).trim())}`, {}, overrides);
}

export function buildBriefUrl(bibId, format = 'json', overrides = {}) {
  if (!bibId || !String(bibId).trim()) throw new TypeError('bibId is required');
  return makeUrl(`/engine/items/brief/${format}/${encodeURIComponent(String(bibId).trim())}`, {}, overrides);
}

export function buildMetadataUrl(bibId, schema = 'dc', overrides = {}) {
  const allowed = new Set(['dc', 'mods', 'marc', 'rdf']);
  if (!allowed.has(schema)) throw new TypeError(`Unsupported schema: ${schema}`);
  if (!bibId || !String(bibId).trim()) throw new TypeError('bibId is required');
  return makeUrl(`/engine/items/xml/${schema}/${encodeURIComponent(String(bibId).trim())}`, {}, overrides);
}

export function buildRandomUrl(overrides = {}) {
  return makeUrl('/engine/items/random', {}, overrides);
}

export function buildThumbnailUrl(bibId, filename, overrides = {}) {
  if (!bibId || !filename) throw new TypeError('bibId and filename are required');
  const pairs = String(bibId).match(/.{1,2}/g) || [];
  return makeUrl(`/content/${pairs.join('/')}/00001/${encodeURIComponent(filename)}`, {}, overrides);
}

function looksLikeVerificationPage(text, contentType = '') {
  const normalized = text.toLowerCase();
  return contentType.includes('text/html') && (
    normalized.includes('verifying that you are human') ||
    normalized.includes('verify you are human') ||
    normalized.includes('cf-turnstile') ||
    normalized.includes('cloudflare')
  );
}

export async function request(url, overrides = {}) {
  const { timeoutMs, cookie } = getConfig(overrides);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      headers: {
        accept: 'application/json, application/xml;q=0.9, text/plain;q=0.8, */*;q=0.5',
        'user-agent': 'wolfsonian-public-api-research/0.1 (+independent research prototype)',
        ...(cookie ? { cookie } : {})
      },
      signal: controller.signal,
      redirect: 'follow'
    });

    const text = await response.text();
    const contentType = response.headers.get('content-type') || '';

    if (looksLikeVerificationPage(text, contentType)) {
      throw new WolfsonianApiError(
        'The public host returned a human-verification page instead of machine-readable data.',
        {
          status: response.status,
          url: response.url,
          contentType,
          kind: 'verification-page',
          suggestion: 'Retry in a regular browser, provide an approved session cookie locally, or ask the technical team about a research route or export.'
        }
      );
    }

    if (!response.ok) {
      throw new WolfsonianApiError(`Request failed with HTTP ${response.status}.`, {
        status: response.status,
        url: response.url,
        contentType,
        bodyPreview: text.slice(0, 300)
      });
    }

    if (contentType.includes('json') || text.trim().startsWith('{') || text.trim().startsWith('[')) {
      try {
        return { data: JSON.parse(text), response, raw: text };
      } catch (error) {
        throw new WolfsonianApiError('The response looked like JSON but could not be parsed.', {
          url: response.url,
          cause: error.message,
          bodyPreview: text.slice(0, 300)
        });
      }
    }

    return { data: text, response, raw: text };
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new WolfsonianApiError(`Request timed out after ${timeoutMs} ms.`, { url: String(url), kind: 'timeout' });
    }
    if (error instanceof WolfsonianApiError) throw error;
    throw new WolfsonianApiError('Network request failed.', { url: String(url), cause: error.message, kind: 'network' });
  } finally {
    clearTimeout(timer);
  }
}

export async function ping(overrides = {}) {
  const probes = [
    { name: 'citation', url: buildCitationUrl('WOLF037299', 'json', overrides) },
    { name: 'brief', url: buildBriefUrl('WOLF037299', 'json', overrides) },
    { name: 'search', url: buildSearchUrl({ query: 'vase', page: 1, field: 'ZZ' }, overrides) },
    { name: 'random', url: buildRandomUrl(overrides) }
  ];

  const results = [];
  for (const probe of probes) {
    const startedAt = Date.now();
    try {
      const result = await request(probe.url, overrides);
      results.push({
        name: probe.name,
        ok: true,
        status: result.response.status,
        contentType: result.response.headers.get('content-type') || '',
        elapsedMs: Date.now() - startedAt,
        url: String(probe.url)
      });
    } catch (error) {
      results.push({
        name: probe.name,
        ok: false,
        elapsedMs: Date.now() - startedAt,
        url: String(probe.url),
        error: error.message,
        details: error.details || {}
      });
    }
  }
  return results;
}
