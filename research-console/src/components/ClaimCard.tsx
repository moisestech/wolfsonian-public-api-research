import type { EpistemicStatus } from '../contracts/evidence';

type ClaimCardProps = {
  statement?: string;
  readerId?: string;
  objectTitle: string;
  accession: string;
  epistemicStatus: EpistemicStatus;
};

export function ClaimCard({
  statement,
  readerId,
  objectTitle,
  accession,
  epistemicStatus,
}: ClaimCardProps) {
  return (
    <article className="card claim-card">
      <p className="eyebrow">Claim</p>
      <p className={`status status--${epistemicStatus.toLowerCase()}`}>{epistemicStatus}</p>
      {statement ? <p className="claim-text">{statement}</p> : null}
      <dl>
        <div>
          <dt>Reader</dt>
          <dd>{readerId || '—'}</dd>
        </div>
        <div>
          <dt>Object</dt>
          <dd>
            {objectTitle} ({accession})
          </dd>
        </div>
      </dl>
    </article>
  );
}
