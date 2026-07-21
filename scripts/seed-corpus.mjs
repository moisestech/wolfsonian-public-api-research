import { buildSearchUrl, request } from '../src/wolfsonian-api.mjs';
import { parseArgs, safeName, writeJson } from './_utils.mjs';

const args = parseArgs(process.argv.slice(2));
const query = args.query || args._.join(' ');
if (!query) {
  console.error('Usage: npm run seed -- --query propaganda [--pages 3] [--field ZZ]');
  process.exit(1);
}

const pages = Math.max(1, Math.min(Number(args.pages || 1), 20));
const field = String(args.field || 'ZZ').toUpperCase();
const packets = [];

for (let page = 1; page <= pages; page += 1) {
  const url = buildSearchUrl({ query, page, field });
  console.log(`Fetching page ${page}/${pages}: ${url}`);
  const response = await request(url);
  packets.push({ page, endpoint: response.response.url, data: response.data });
}

const corpus = {
  createdAt: new Date().toISOString(),
  source: 'The Wolfsonian publicly documented digital collection API',
  query,
  field,
  pageCountRequested: pages,
  packets
};

const outputPath = `data/derived/corpus-${safeName(query)}.json`;
await writeJson(outputPath, corpus);
console.log(`Saved ${outputPath}`);
