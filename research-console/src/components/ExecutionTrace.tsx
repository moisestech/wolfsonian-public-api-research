import type { ExecutionStep } from '../contracts/evidence';

type ExecutionTraceProps = {
  steps: ExecutionStep[];
};

/** Legacy authored lookup outline. Genuine tool events are emitted by the source-gated runner and will be wired into the console in the next PR. */
export function ExecutionTrace({ steps }: ExecutionTraceProps) {
  if (!steps.length) return null;
  return (
    <article className="card trace-card">
      <p className="eyebrow">Guided research outline · not a live execution trace</p>
      <ol>
        {steps.map((step) => (
          <li key={step.id}>
            <span className="trace-status">guide</span> {step.label}
          </li>
        ))}
      </ol>
    </article>
  );
}
