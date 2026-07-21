import { ping } from '../src/wolfsonian-api.mjs';

const results = await ping();
console.table(results.map(({ name, ok, status, elapsedMs, error }) => ({ name, ok, status: status || '—', elapsedMs, error: error || '' })));

const failed = results.filter((result) => !result.ok);
if (failed.length) {
  console.error('\nOne or more probes did not return machine-readable data.');
  for (const item of failed) {
    console.error(`- ${item.name}: ${item.error}`);
    if (item.details?.suggestion) console.error(`  ${item.details.suggestion}`);
  }
  process.exitCode = 1;
}
