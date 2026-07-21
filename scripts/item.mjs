import { buildBriefUrl, buildCitationUrl, buildMetadataUrl, request } from '../src/wolfsonian-api.mjs';
import { parseArgs, safeName, writeJson } from './_utils.mjs';

const args = parseArgs(process.argv.slice(2));
const bibId = args.bibid || args._[0];
if (!bibId) {
  console.error('Usage: npm run item -- WOLF037299');
  process.exit(1);
}

const [citation, brief, dc, mods] = await Promise.all([
  request(buildCitationUrl(bibId)),
  request(buildBriefUrl(bibId)),
  request(buildMetadataUrl(bibId, 'dc')),
  request(buildMetadataUrl(bibId, 'mods'))
]);

const packet = {
  retrievedAt: new Date().toISOString(),
  bibId,
  endpoints: {
    citation: citation.response.url,
    brief: brief.response.url,
    dublinCore: dc.response.url,
    mods: mods.response.url
  },
  citation: citation.data,
  brief: brief.data,
  dublinCoreXml: dc.data,
  modsXml: mods.data
};

const outputPath = `data/raw/item-${safeName(bibId)}.json`;
await writeJson(outputPath, packet);
console.log(`Saved ${outputPath}`);
