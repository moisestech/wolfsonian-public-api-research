import {
  MessagePrimitive,
  type DataMessagePartComponent,
  type TextMessagePartComponent,
} from '@assistant-ui/react';
import type { RadioTvAnswerPayload } from '../adapters/radio-tv-chat-adapter';
import { RadioTvSourceCards } from './RadioTvSourceCards';
import { ToolActivityTrace } from './ToolActivityTrace';

const TextPart: TextMessagePartComponent = ({ text }) => <p>{text}</p>;

const RadioTvResultPart: DataMessagePartComponent<RadioTvAnswerPayload> = ({ data }) => {
  const result = data.result;
  return (
    <div className="answer-stack">
      {result?.comparison && <article className="card">
        <p className="eyebrow">Relationship · artist-authored comparison</p>
        <p>{result.comparison.proposal}</p>
        <p className="status status--not_established">Historical relationship NOT ESTABLISHED</p>
        <p>{result.comparison.limitations}</p>
      </article>}
      {result?.status === 'blocked' && <p role="alert" className="error">
        Evidence gate blocked this request: <code>{result.errorCode}</code>.
        No unsupported research answer was returned.
      </p>}
      {result?.status === 'failed' && <p role="alert" className="error">
        Public-source retrieval failed: <code>{result.errorCode}</code>. Please retry.
      </p>}
      {result?.records && <RadioTvSourceCards records={result.records} />}
      <ToolActivityTrace events={data.events} />
      {result?.citationCheck && <p className="trace-note">
        Citation check: reference identities resolved only. Semantic entailment was not assessed.
      </p>}
    </div>
  );
};

export function RadioTvMessage() {
  return (
    <>
      <MessagePrimitive.If user>
        <MessagePrimitive.Root className="message message--user">
          <p className="message-role">Researcher</p>
          <MessagePrimitive.Parts components={{ Text: TextPart }} />
        </MessagePrimitive.Root>
      </MessagePrimitive.If>
      <MessagePrimitive.If assistant>
        <MessagePrimitive.Root className="message message--assistant">
          <p className="message-role">Public-source research</p>
          <MessagePrimitive.Parts components={{ Text: TextPart, data: {
            by_name: { 'radio-tv-research': RadioTvResultPart },
          } }} />
        </MessagePrimitive.Root>
      </MessagePrimitive.If>
    </>
  );
}
