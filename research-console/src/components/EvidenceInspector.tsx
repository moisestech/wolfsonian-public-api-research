type EvidenceInspectorProps = {
  sourceFields: string[];
  established: string[];
  notEstablished: string[];
  citedAt: string;
  publicRecordUrl?: string;
};

export function EvidenceInspector({
  sourceFields,
  established,
  notEstablished,
  citedAt,
  publicRecordUrl,
}: EvidenceInspectorProps) {
  return (
    <article className="card evidence-card">
      <p className="eyebrow">Evidence inspector</p>
      <dl>
        <div>
          <dt>Packet prepared / cited</dt>
          <dd>{citedAt}</dd>
        </div>
        <div>
          <dt>Source field paths</dt>
          <dd>{sourceFields.length ? sourceFields.join(', ') : '(none)'}</dd>
        </div>
      </dl>
      <div className="lists">
        <section>
          <h3>ESTABLISHED</h3>
          <ul>
            {established.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
        <section>
          <h3>NOT ESTABLISHED</h3>
          <ul>
            {notEstablished.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </div>
      {publicRecordUrl ? (
        <p>
          <a href={publicRecordUrl} target="_blank" rel="noopener noreferrer">
            Public source record
          </a>
        </p>
      ) : null}
    </article>
  );
}
