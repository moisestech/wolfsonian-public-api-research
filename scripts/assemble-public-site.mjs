import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

export const PUBLIC_DIRECTORIES = [
  'demo',
  'world',
  'node_modules/three/build',
  'node_modules/three/examples/jsm',
];

export const PUBLIC_FILES = [
  'index.html',
  'src/archive-evidence.mjs',
  'src/archive-location.mjs',
  'src/archive-society.mjs',
  'src/atlas-graph.mjs',
  'src/atlas-scripts.mjs',
  'src/curated-edge-scenes.mjs',
  'src/curatorial-relationships.mjs',
  'src/discovery-dialogue.mjs',
  'src/discovery-graph.mjs',
  'src/discovery-personas.mjs',
  'src/persona-sigils.mjs',
  'src/persona-cloudinary-assets.mjs',
  'src/persona-character-portraits.mjs',
  'src/persona-illustrated-gallery.mjs',
  'src/force-graph-data.mjs',
  'src/lakehouse-matches.mjs',
  'src/local-image-index.mjs',
  'src/local-images.mjs',
  'src/machine-age-onview.mjs',
  'src/machine-age-primary-leads.mjs',
  'src/machine-age-research.mjs',
  'src/machine-age-visitor-dialogue.mjs',
  'src/matrix-room.mjs',
  'src/public-matrix-objects.mjs',
  'src/object-lens-core.mjs',
  'src/presentation-pairs.mjs',
  'src/session-images.mjs',
  'src/sprite-fit.mjs',
  'src/conversation-orientation.mjs',
  'src/scene-performance.mjs',
  'src/visitor-guide.mjs',
  'src/worlds-fairs-research.mjs',
  'src/zoom-stops.mjs',
];

export const FORBIDDEN_OUTPUT = [
  'src/matrix-objects.mjs',
  'data/lakehouse/project-matches.json',
];

const FORBIDDEN_NAMES = new Set([
  'matrix-objects.mjs',
  'project-matches.json',
  '.env',
  '.env.local',
]);

const STAFF_MATRIX_MARKER = 'mx-2009-5-1';
const LAKEHOUSE_CAPTURE_MARKER = '2026-11-16T15:29:52.717Z';

async function walk(dir, files = []) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) await walk(path, files);
    else files.push(path);
  }
  return files;
}

export async function assertPublicOutput(out) {
  const files = await walk(out);
  const violations = [];
  for (const file of files) {
    const rel = relative(out, file);
    const name = rel.split('/').at(-1);
    if (FORBIDDEN_NAMES.has(name) || FORBIDDEN_OUTPUT.some(item => rel === item || rel.endsWith('/' + item))) violations.push(rel);
    if (rel.startsWith('node_modules/')) continue;
    if (!/\.(mjs|js|json|html|css|md|txt|svg)$/.test(rel)) continue;
    const text = await readFile(file, 'utf8');
    if (text.includes(STAFF_MATRIX_MARKER)) violations.push(rel + ' contains the staff matrix');
    if (text.includes(LAKEHOUSE_CAPTURE_MARKER)) violations.push(rel + ' contains the saved Lakehouse capture');
  }
  if (violations.length) throw new Error('Public output includes unapproved museum data:\n' + violations.join('\n'));
  return files.length;
}

export async function assemblePublicSite(destination, { requireResearchConsole = false } = {}) {
  const out = destination.startsWith('/') ? destination : join(root, destination);
  if (PUBLIC_FILES.some(file => FORBIDDEN_OUTPUT.includes(file)) || PUBLIC_DIRECTORIES.some(dir => FORBIDDEN_OUTPUT.some(item => item.startsWith(dir + '/')))) {
    throw new Error('Allowlist includes a forbidden museum dataset.');
  }
  await rm(out, { recursive: true, force: true });
  await mkdir(out, { recursive: true });
  for (const dir of PUBLIC_DIRECTORIES) await cp(join(root, dir), join(out, dir), { recursive: true, dereference: true });
  for (const file of PUBLIC_FILES) {
    await mkdir(dirname(join(out, file)), { recursive: true });
    await cp(join(root, file), join(out, file));
  }
  for (const rel of ['src/matrix-room.mjs', 'src/lakehouse-matches.mjs']) {
    const file = join(out, rel);
    const text = await readFile(file, 'utf8');
    const staffImport = "from './matrix-objects.mjs'";
    if (!text.includes(staffImport)) throw new Error(rel + ' no longer imports the staff matrix under the expected name.');
    await writeFile(file, text.replaceAll(staffImport, "from './public-matrix-objects.mjs'"));
  }
  const consoleFrom = join(root, 'research-console/dist');
  try {
    await cp(consoleFrom, join(out, 'research-console/dist'), { recursive: true, dereference: true });
  } catch (error) {
    if (error.code !== 'ENOENT' || requireResearchConsole) throw error;
  }
  await writeFile(join(out, 'robots.txt'), 'User-agent: *\nAllow: /\n');
  const count = await assertPublicOutput(out);
  return { out, count };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const destination = process.argv[2] || 'public-site';
  const requireResearchConsole = process.argv.includes('--require-console');
  const result = await assemblePublicSite(destination, { requireResearchConsole });
  console.log('Public site: ' + result.out + ' (' + result.count + ' files). Staff matrix and Lakehouse capture omitted.');
}
