import type { ChatModelAdapter, ThreadMessageLike } from '@assistant-ui/react';
import {
  runRadioTvResearch,
  type RadioTvEvent,
  type RadioTvResult,
  type RadioTvRoom,
} from '../../../src/radio-tv-research-tools.mjs';

export const RADIO_TV_QUESTIONS = [
  { id: 'compare', label: 'Why are Radio and Television paired?', intent: 'compare' },
  { id: 'inspect', label: 'What do the published source packets identify?', intent: 'inspect' },
  { id: 'limits', label: 'What remains unknown about their audiences?', intent: 'limits' },
  { id: 'bad-citation', label: 'Test: reject a fabricated citation', intent: 'compare' },
  { id: 'unsupported', label: 'Test: ask for an unsupported private record', intent: 'unsupported' },
] as const;

export type RadioTvAnswerPayload = {
  events: RadioTvEvent[];
  result: RadioTvResult | null;
};

export function buildRadioTvOpeningMessages(): ThreadMessageLike[] {
  return [{
    role: 'assistant',
    content: [{ type: 'text', text:
      'This is an artist-authored pairing, not evidence that the devices shared a household or historical audience. Choose a bounded public-source investigation. Tool activity below will represent operations that actually run, not model thinking.' }],
    status: { type: 'complete', reason: 'stop' },
  }];
}

function matchRequest(text: string) {
  return RADIO_TV_QUESTIONS.find(row => row.label === text || row.id === text);
}

export function createRadioTvChatAdapter(
  room: RadioTvRoom,
  loadPublicPacket: (packetId: string) => Promise<unknown>,
): ChatModelAdapter {
  return {
    async *run({ messages }) {
      const userMessage = [...messages].reverse().find(message => message.role === 'user');
      const text = userMessage?.content?.filter(
        (part): part is { type: 'text'; text: string } => part.type === 'text',
      ).map(part => part.text).join('\n').trim() || '';
      const request = matchRequest(text);
      const events: RadioTvEvent[] = [];
      const resultBox: { current: RadioTvResult | null } = { current: null };
      let settled = false;
      let wake: (() => void) | null = null;
      const signal = () => {
        const callback = wake;
        wake = null;
        if (callback) callback();
      };
      // Actual source operations run concurrently with this adapter's streaming
      // loop; every incremental update contains *observed* events only.
      const task = runRadioTvResearch({
        room,
        intent: request?.intent || 'unsupported',
        loadPublicPacket,
        claimedCitationIds: request?.id === 'bad-citation' ? ['WOLF-999:date'] : [],
        onEvent(event) {
          events.push(event);
          signal();
        },
      }).then(value => {
        resultBox.current = value;
        settled = true;
        signal();
      }).catch(() => {
        // The runner already converts expected failures to typed results.
        settled = true;
        signal();
      });
      let observedCount = 0;
      while (!settled || observedCount < events.length) {
        if (observedCount === events.length) {
          await new Promise<void>(resolve => { wake = resolve; });
          continue;
        }
        observedCount = events.length;
        yield {
          content: [
            { type: 'text', text: 'Checking the approved public source packets…' },
            { type: 'data', name: 'radio-tv-research', data: {
              events: events.slice(), result: null,
            } satisfies RadioTvAnswerPayload },
          ],
        };
      }
      await task;
      const finished = resultBox.current;
      yield {
        content: [
          { type: 'text', text: finished?.answer ??
            (finished?.status === 'blocked'
              ? 'NOT ESTABLISHED. This request was blocked by the public-source gate.'
              : 'The source investigation could not be completed. No unsupported facts were returned.') },
          { type: 'data', name: 'radio-tv-research', data: {
            events: events.slice(), result: finished,
          } satisfies RadioTvAnswerPayload },
        ],
      };
    },
  };
}
