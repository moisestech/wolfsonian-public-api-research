import type { RadioTvRecord } from '../../../src/radio-tv-research-tools.mjs';

export function RadioTvSourceCards({ records }: { records: RadioTvRecord[] }) {
  if (!records.length) return null;
  return (
    <section aria-label="Verified public source receipts" className="source-grid">
      {records.map(record => (
        <article className="card source-card" key={record.packetId}>
          <p className="eyebrow">Public packet · {record.packetId}</p>
          <h3>{record.title}</h3>
          <dl>
            <div><dt>Accession</dt><dd>{record.accession}</dd></div>
            <div><dt>Year</dt><dd>{record.date}</dd></div>
            <div><dt>Creator</dt><dd>{record.creator.join('; ')}</dd></div>
            <div><dt>Materials</dt><dd>{record.materials.join(', ')}</dd></div>
            <div><dt>Packet prepared</dt><dd>{record.retrievedAt}</dd></div>
          </dl>
          <a href={record.sourceUrl} target="_blank" rel="noopener noreferrer">
            Open published museum source
          </a>
          <details>
            <summary>Inspect evidence IDs and snapshot digest</summary>
            <p className="digest">SHA-256 of approved public projection: <code>{record.packetSha256}</code></p>
            <ul className="source-fields">
              {record.fields.map(ref => (
                <li key={ref.evidenceId}><code>{ref.evidenceId}</code>
                  <span> · {Array.isArray(ref.value) ? ref.value.join(', ') : ref.value}</span>
                </li>
              ))}
            </ul>
            <p className="trace-note">A valid source locator is not proof of an interpretive claim.</p>
          </details>
        </article>
      ))}
    </section>
  );
}
