import type { RadioTvEvent } from '../../../src/radio-tv-research-tools.mjs';

/** Actual operation receipts, NOT authored dramaturgy or a model's private reasoning. */
export function ToolActivityTrace({ events }: { events: RadioTvEvent[] }) {
  if (!events.length) return null;
  return (
    <section className="card operation-trace" aria-label="Actual research operations">
      <p className="eyebrow">Observed tool activity · deterministic public packets</p>
      <details open>
        <summary>{events.length} recorded operation event{events.length === 1 ? '' : 's'}</summary>
        <ol className="trace-events">
          {events.map(event => (
            <li key={event.eventId} className={'event--' + event.status}>
              <span className="trace-event-title">
                <span aria-hidden="true">{event.status === 'completed' ? '✓' : event.status === 'failed' || event.status === 'blocked' ? '!' : '·'}</span>
                {' '}{event.kind}
              </span>
              {event.toolName && <span> · {event.toolName}</span>}
              {event.resourceId && <span> · <code>{event.resourceId}</code></span>}
              {typeof event.durationMs === 'number' && <small> · {event.durationMs.toFixed(1)} ms measured</small>}
              {event.errorCode && <strong className="trace-error"> · {event.errorCode}</strong>}
            </li>
          ))}
        </ol>
        <p className="trace-note">Run: <code>{events[0].runId}</code>. These are real JavaScript operations on local public packets, not autonomous LLM reasoning.</p>
      </details>
    </section>
  );
}
