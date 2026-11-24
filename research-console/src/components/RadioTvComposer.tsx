import { RADIO_TV_QUESTIONS } from '../adapters/radio-tv-chat-adapter';

export function RadioTvComposer({ onAsk, disabled }: {
  onAsk: (label: string) => void;
  disabled: boolean;
}) {
  return (
    <section className="composer" aria-label="Bounded public-source investigation">
      <p className="eyebrow">Research with the approved public packets</p>
      <div className="composer-grid">
        {RADIO_TV_QUESTIONS.map(question => (
          <button type="button" key={question.id} disabled={disabled}
            onClick={() => onAsk(question.label)}>
            {question.label}
          </button>
        ))}
      </div>
      <p className="composer-note">The research actions use deterministic read-only tools.
        The two tests deliberately demonstrate blocked access and unsupported citations.
        Free-form historical claims are not generated.</p>
    </section>
  );
}
