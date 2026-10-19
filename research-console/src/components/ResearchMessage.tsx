import {
  MessagePrimitive,
  type DataMessagePartComponent,
  type TextMessagePartComponent,
} from '@assistant-ui/react';
import { ClaimCard } from './ClaimCard';
import { EvidenceInspector } from './EvidenceInspector';
import { ExecutionTrace } from './ExecutionTrace';
import type { ResearchAnswerPayload } from '../adapters/guided-chat-adapter';

const TextPart: TextMessagePartComponent = ({ text }) => <p>{text}</p>;

const ResearchAnswerPart: DataMessagePartComponent<ResearchAnswerPayload> = ({ data }) => {
  const { answer, objectTitle, accession, citedAt, publicRecordUrl } = data;
  return (
    <div className="answer-stack">
      <ClaimCard
        statement={answer.claimText}
        readerId={answer.readerId}
        objectTitle={objectTitle}
        accession={accession}
        epistemicStatus={answer.epistemicStatus}
      />
      <EvidenceInspector
        sourceFields={answer.sourceFields}
        established={answer.established}
        notEstablished={answer.notEstablished}
        citedAt={citedAt}
        publicRecordUrl={publicRecordUrl}
      />
      <ExecutionTrace steps={answer.steps} />
    </div>
  );
};

export function ResearchMessage() {
  return (
    <>
      <MessagePrimitive.If user>
        <MessagePrimitive.Root className="message message--user">
          <p className="message-role">user</p>
          <MessagePrimitive.Parts components={{ Text: TextPart }} />
        </MessagePrimitive.Root>
      </MessagePrimitive.If>
      <MessagePrimitive.If assistant>
        <MessagePrimitive.Root className="message message--assistant">
          <p className="message-role">assistant</p>
          <MessagePrimitive.Parts
            components={{
              Text: TextPart,
              data: {
                by_name: {
                  'research-answer': ResearchAnswerPart,
                },
              },
            }}
          />
        </MessagePrimitive.Root>
      </MessagePrimitive.If>
      <MessagePrimitive.If system>
        <MessagePrimitive.Root className="message message--system">
          <p className="message-role">system</p>
          <MessagePrimitive.Parts components={{ Text: TextPart }} />
        </MessagePrimitive.Root>
      </MessagePrimitive.If>
    </>
  );
}
