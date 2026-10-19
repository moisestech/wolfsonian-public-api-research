import { useEffect, useMemo, useState } from 'react';
import {
  AssistantRuntimeProvider,
  ThreadPrimitive,
  useAuiState,
  useLocalRuntime,
} from '@assistant-ui/react';
import {
  buildOpeningMessages,
  createGuidedChatAdapter,
} from './adapters/guided-chat-adapter';
import { GUIDED_QUESTIONS, loadPublicPacket } from './adapters/wolfsonian-research';
import { ResearchComposer } from './components/ResearchComposer';
import { ResearchMessage } from './components/ResearchMessage';
import type { PublicPacket } from './contracts/evidence';
import { parseHandoffFromLocation, type ResearchHandoff } from './contracts/navigation';

function SessionComposer({
  onAsk,
}: {
  onAsk: (questionId: string, label: string) => void;
}) {
  const isRunning = useAuiState((state) => state.thread.isRunning);
  return <ResearchComposer disabled={isRunning} onAsk={onAsk} />;
}

function ResearchSession({
  packet,
  handoff,
}: {
  packet: PublicPacket;
  handoff: ResearchHandoff;
}) {
  const adapter = useMemo(
    () => createGuidedChatAdapter(packet, handoff),
    [packet, handoff],
  );
  const initialMessages = useMemo(
    () => buildOpeningMessages(packet, handoff),
    [packet, handoff],
  );
  const runtime = useLocalRuntime(adapter, { initialMessages });

  function ask(questionId: string, label: string) {
    const prompt =
      questionId === 'free'
        ? label
        : (GUIDED_QUESTIONS.find((row) => row.id === questionId)?.label ?? label);
    runtime.thread.append({
      role: 'user',
      content: [{ type: 'text', text: prompt }],
    });
  }

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <main className="shell">
        <header className="top">
          <div>
            <p className="eyebrow">Archive Dreams in Public · Research console</p>
            <h1>{packet.source.title}</h1>
            <p>
              Reader <strong>{handoff.readerId}</strong> · Accession{' '}
              {packet.source.accessionNumber} · Revision {handoff.sourceRevision}
            </p>
            <p className="preview-badge">Preview · LocalRuntime · no live LLM</p>
          </div>
          <a className="return-link" href="/world/">
            Return to world
          </a>
        </header>

        <ThreadPrimitive.Root className="thread-root">
          <ThreadPrimitive.Viewport className="thread" autoScroll>
            <ThreadPrimitive.Messages components={{ Message: ResearchMessage }} />
          </ThreadPrimitive.Viewport>
        </ThreadPrimitive.Root>

        <SessionComposer onAsk={ask} />
      </main>
    </AssistantRuntimeProvider>
  );
}

/**
 * Deterministic research console on assistant-ui LocalRuntime + ChatModelAdapter.
 * Answers only guided questions against the approved public packet (no live LLM).
 */
export default function App() {
  const parsed = useMemo(() => parseHandoffFromLocation(), []);
  const [packet, setPacket] = useState<PublicPacket | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const handoff: ResearchHandoff | null = parsed.ok ? parsed.handoff : null;

  useEffect(() => {
    if (!handoff) return;
    let cancelled = false;
    (async () => {
      try {
        const loaded = await loadPublicPacket(handoff.objectId);
        if (!cancelled) setPacket(loaded);
      } catch (error) {
        if (!cancelled) setLoadError(String(error instanceof Error ? error.message : error));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [handoff]);

  if (!parsed.ok) {
    return (
      <main className="shell">
        <header>
          <p className="eyebrow">Research console</p>
          <h1>Missing or invalid research context</h1>
          <p>
            Open this console from the living-world inspector so objectId, claimId, and
            sourceRevision are validated against the public corpus.
          </p>
          <p className="error">Reason: {parsed.reason}</p>
          <p>
            <a href="/world/">Return to living world</a>
          </p>
        </header>
      </main>
    );
  }

  if (loadError) {
    return (
      <main className="shell">
        <header>
          <h1>Packet load failed</h1>
          <p className="error">{loadError}</p>
          <a href="/world/">Return to world</a>
        </header>
      </main>
    );
  }

  if (!packet || !handoff) {
    return (
      <main className="shell">
        <p>Loading public packet…</p>
      </main>
    );
  }

  return <ResearchSession packet={packet} handoff={handoff} />;
}
