import type { ChatModelAdapter, ThreadMessageLike } from '@assistant-ui/react';
import type { PublicPacket, ResearchAnswer } from '../contracts/evidence';
import type { ResearchHandoff } from '../contracts/navigation';
import { answerGuidedQuestion, matchGuidedQuestion } from './wolfsonian-research';

export type ResearchAnswerPayload = {
  answer: ResearchAnswer;
  objectTitle: string;
  accession: string;
  citedAt: string;
  publicRecordUrl: string;
};

export function buildOpeningMessages(
  packet: PublicPacket,
  handoff: ResearchHandoff,
): ThreadMessageLike[] {
  const reader = packet.agents[handoff.readerId];
  const answer: ResearchAnswer = {
    questionId: 'context',
    title: 'Selected claim',
    body: reader
      ? `Selected claim (${handoff.readerId}): ${reader.claim}`
      : 'Selected claim context loaded.',
    epistemicStatus: 'INFERENCE',
    claimText: reader?.claim,
    readerId: handoff.readerId,
    sourceFields: (reader?.evidence || []).map((row) => row.sourceRef || row.text),
    established: packet.archivalActor.establishedInPublicPacket,
    notEstablished: packet.archivalActor.notEstablishedInPublicPacket,
    steps: [
      { id: 's1', label: 'Claim selected', status: 'completed' },
      { id: 's2', label: 'Public packet loaded', status: 'completed' },
    ],
  };

  const payload: ResearchAnswerPayload = {
    answer,
    objectTitle: packet.source.title,
    accession: packet.source.accessionNumber,
    citedAt: packet.source.citedAt,
    publicRecordUrl: packet.source.publicRecordUrl,
  };

  return [
    {
      role: 'system',
      content: `Research context locked to ${packet.source.title} · reader ${handoff.readerId} · revision ${handoff.sourceRevision}.`,
    },
    {
      role: 'assistant',
      content: [
        { type: 'text', text: answer.body },
        { type: 'data', name: 'research-answer', data: payload },
      ],
      status: { type: 'complete', reason: 'stop' },
    },
  ];
}

export function createGuidedChatAdapter(
  packet: PublicPacket,
  handoff: ResearchHandoff,
): ChatModelAdapter {
  return {
    async *run({ messages }) {
      const lastUser = [...messages].reverse().find((message) => message.role === 'user');
      const text =
        lastUser?.content
          ?.filter((part): part is { type: 'text'; text: string } => part.type === 'text')
          .map((part) => part.text)
          .join('\n')
          .trim() || '';

      const questionId = matchGuidedQuestion(text);
      const answer = answerGuidedQuestion(questionId, packet, handoff);
      const payload: ResearchAnswerPayload = {
        answer,
        objectTitle: packet.source.title,
        accession: packet.source.accessionNumber,
        citedAt: packet.source.citedAt,
        publicRecordUrl: packet.source.publicRecordUrl,
      };

      yield {
        content: [
          { type: 'text', text: answer.body },
          { type: 'data', name: 'research-answer', data: payload },
        ],
      };
    },
  };
}
