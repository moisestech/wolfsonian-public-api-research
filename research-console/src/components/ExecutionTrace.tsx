import type { ExecutionStep } from '../contracts/evidence';

type ExecutionTraceProps = {
  steps: ExecutionStep[];
};

/** Lightweight Trace stand-in scoped to operations that actually ran. */
export function ExecutionTrace({ steps }: ExecutionTraceProps) {
  if (!steps.length) return null;
  return (
    <article className="card trace-card">
      <p className="eyebrow">Execution trace</p>
      <ol>
        {steps.map((step) => (
          <li key={step.id}>
            <span className="trace-status">{step.status}</span> {step.label}
          </li>
        ))}
      </ol>
    </article>
  );
}
