import { GUIDED_QUESTIONS } from '../adapters/wolfsonian-research';

type ResearchComposerProps = {
  disabled?: boolean;
  onAsk: (questionId: string, label: string) => void;
};

export function ResearchComposer({ disabled, onAsk }: ResearchComposerProps) {
  return (
    <section className="composer" aria-label="Guided research questions">
      <p className="eyebrow">Ask a guided question</p>
      <div className="composer-grid">
        {GUIDED_QUESTIONS.map((question) => (
          <button
            key={question.id}
            type="button"
            disabled={disabled}
            onClick={() => onAsk(question.id, question.label)}
          >
            {question.label}
          </button>
        ))}
      </div>
      <p className="composer-note">
        Free-form historical questions are refused with an explicit NOT ESTABLISHED response.
      </p>
    </section>
  );
}
