import { useEffect, useMemo, useState } from 'react';
import {
  AssistantRuntimeProvider,
  ThreadPrimitive,
  useAuiState,
  useLocalRuntime,
} from '@assistant-ui/react';
import {
  buildRadioTvOpeningMessages,
  createRadioTvChatAdapter,
} from './adapters/radio-tv-chat-adapter';
import { RadioTvComposer } from './components/RadioTvComposer';
import { RadioTvMessage } from './components/RadioTvMessage';
import type { RadioTvRoom } from '../../src/radio-tv-research-tools.mjs';

const directory = import.meta.env.BASE_URL + 'data/radio-tv/';

async function fetchPublicJson(path: string): Promise<unknown> {
  const response = await fetch(directory + path, {
    headers: { Accept: 'application/json' },
    credentials: 'omit',
  });
  if (!response.ok) throw new Error('PUBLIC_PACKET_FETCH_FAILED');
  return response.json();
}

async function loadApprovedPacket(packetId: string): Promise<unknown> {
  if (packetId !== 'WOLF-008' && packetId !== 'WOLF-002') {
    throw new Error('PACKET_NOT_APPROVED');
  }
  return fetchPublicJson(packetId + '.json');
}

function ResearchChoices({ onAsk }: { onAsk: (label: string) => void }) {
  const running = useAuiState(state => state.thread.isRunning);
  return <RadioTvComposer onAsk={onAsk} disabled={running} />;
}

function RadioTvSession({ room }: { room: RadioTvRoom }) {
  const adapter = useMemo(() => createRadioTvChatAdapter(room, loadApprovedPacket), [room]);
  const initialMessages = useMemo(() => buildRadioTvOpeningMessages(), []);
  const runtime = useLocalRuntime(adapter, { initialMessages });

  const ask = (label: string) => runtime.thread.append({
    role: 'user', content: [{ type: 'text', text: label }],
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <main className="shell radio-tv-shell">
        <header className="top">
          <div>
            <p className="eyebrow">Archive Dreams in Public · Research console</p>
            <h1>When does a household become an audience?</h1>
            <p>RCA Victor TRK 12 · 2012.6.1 / Sparton 558-C · XX1990.1484</p>
            <p className="preview-badge">Public-record research preview · deterministic tools · no live LLM</p>
          </div>
          <a className="return-link" href="/demo/archive-society/?screen=townhall">
            Townhall
          </a>
        </header>
        <section className="card radio-tv-intro" aria-label="Epistemic boundary">
          <p><strong>Two designs for receiving media, one unresolved question.</strong></p>
          <p>This is an artist-authored curatorial juxtaposition, not evidence
            that the devices shared owners, listeners, broadcasts or households.
            The original scripted room remains unchanged.</p>
          <p className="trace-note">If you opened this console from the Townhall,
            the original room remains open in its other tab.</p>
        </section>
        <ThreadPrimitive.Root className="thread-root">
          <ThreadPrimitive.Viewport className="thread" autoScroll>
            <ThreadPrimitive.Messages components={{ Message: RadioTvMessage }} />
          </ThreadPrimitive.Viewport>
        </ThreadPrimitive.Root>
        <ResearchChoices onAsk={ask} />
      </main>
    </AssistantRuntimeProvider>
  );
}

export function RadioTvApp() {
  const roomId = new URLSearchParams(window.location.search).get('roomId');
  const [room, setRoom] = useState<RadioTvRoom | null>(null);
  const [failure, setFailure] = useState<string | null>(null);
  useEffect(() => {
    if (roomId !== 'radio-and-television') {
      setFailure('ROOM_NOT_APPROVED');
      return;
    }
    let cancelled = false;
    fetchPublicJson('room.json').then(value => {
      const row = value as RadioTvRoom;
      if (row?.id !== 'radio-and-television' ||
          row.relationshipType !== 'curatorial_juxtaposition' ||
          row.historicalRelationshipEstablished !== false ||
          row.source?.accession !== '2012.6.1' ||
          row.target?.accession !== 'XX1990.1484' ||
          row.source?.packet !== 'WOLF-008' ||
          row.target?.packet !== 'WOLF-002') throw new Error('ROOM_MANIFEST_INVALID');
      if (!cancelled) setRoom(row);
    }).catch(() => { if (!cancelled) setFailure('PUBLIC_ROOM_LOAD_FAILED'); });
    return () => { cancelled = true; };
  }, [roomId]);

  if (failure) {
    return <main className="shell" role="alert">
      <h1>Research room unavailable</h1>
      <p>The public research room could not be validated ({failure}).
        No unsupported source material was loaded.</p>
      <a href="/demo/archive-society/?screen=townhall">Return to Townhall</a>
    </main>;
  }
  if (!room) return <main className="shell"><p>Loading approved public research room…</p></main>;
  return <RadioTvSession room={room} />;
}
