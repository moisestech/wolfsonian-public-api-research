import { buildSearchStatsUrl, buildSearchUrl, request } from '../src/wolfsonian-api.mjs';
import { parseArgs, safeName, writeJson } from './_utils.mjs';

const args = parseArgs(process.argv.slice(2));
const query = args.query || args._.join(' ');
if (!query) {
  console.error('Usage: npm run search -- --query "world fair" [--page 1] [--field ZZ]');
  process.exit(1);
}

const page = Number(args.page || 1);
const field = String(args.field || 'ZZ').toUpperCase();
const [resultsResponse, statsResponse] = await Promise.all([
  request(buildSearchUrl({ query, page, field })),
  request(buildSearchStatsUrl({ query, field }))
]);

const packet = {
  retrievedAt: new Date().toISOString(),
  query,
  page,
  field,
  endpoints: {
    results: resultsResponse.response.url,
    stats: statsResponse.response.url
  },
  results: resultsResponse.data,
  stats: statsResponse.data
};

const outputPath = `data/raw/search-${safeName(query)}-p${page}.json`;
await writeJson(outputPath, packet);
console.log(`Saved ${outputPath}`);
