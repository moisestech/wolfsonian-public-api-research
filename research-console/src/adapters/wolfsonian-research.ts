import type { PublicPacket, ResearchAnswer, ExecutionStep } from '../contracts/evidence';
import type { ResearchHandoff } from '../contracts/navigation';

export const GUIDED_QUESTIONS = [
  {
    id: 'packet-establishes',
    label: 'What does the public packet establish about this radio?',
  },
  {
    id: 'why-disagree',
    label: 'Why do Worker and Futurist disagree?',
  },
  {
    id: 'source-field',
    label: 'Which source field supports this interpretation?',
  },
  {
    id: 'what-unknown',
    label: 'What remains unknown?',
  },
  {
    id: 'what-would-change',
    label: 'What evidence would change this claim?',
  },
  {
    id: 'after-encounter',
    label: 'What changed after the institutional encounter?',
  },
] as const;

function steps(...labels: string[]): ExecutionStep[] {
  return labels.map((label, index) => ({
    id: `step-${index + 1}`,
    label,
    status: 'completed' as const,
  }));
}

export async function loadPublicPacket(objectId: string): Promise<PublicPacket> {
  if (objectId !== 'WOLF-002') {
    throw new Error(`Unsupported objectId: ${objectId}`);
  }
  const response = await fetch(`${import.meta.env.BASE_URL}data/02-sparton-radio.json`);
  if (!response.ok) {
    throw new Error(`Failed to load public packet (${response.status})`);
  }
  return (await response.json()) as PublicPacket;
}

export function answerGuidedQuestion(
  questionId: string,
  packet: PublicPacket,
  handoff: ResearchHandoff,
): ResearchAnswer {
  const reader = packet.agents[handoff.readerId];
  const worker = packet.agents.worker;
  const futurist = packet.agents.futurist;

  if (questionId === 'packet-establishes') {
    return {
      questionId,
      title: 'What the public packet establishes',
      body: `The packet identifies ${packet.source.title} (${packet.source.accessionNumber}), dated ${packet.source.date}, materials ${packet.source.materials}. These are ESTABLISHED identification facts in the public packet prepared ${packet.source.citedAt}. Interpretive claims about progress or labor are not established by those fields alone.`,
      epistemicStatus: 'ESTABLISHED',
      claimText: reader?.claim,
      readerId: handoff.readerId,
      sourceFields: ['source.title', 'source.accessionNumber', 'source.date', 'source.materials'],
      established: packet.archivalActor.establishedInPublicPacket,
      notEstablished: packet.archivalActor.notEstablishedInPublicPacket,
      steps: steps(
        'Claim context loaded',
        'Public packet loaded',
        'Cited identification fields resolved',
        'Evidence boundary checked',
      ),
    };
  }

  if (questionId === 'why-disagree') {
    return {
      questionId,
      title: 'Why Worker and Futurist disagree',
      body: `Futurist claims: "${futurist.claim}" Worker claims: "${worker.claim}" Both are INFERENCE readings of the same object. The packet cannot adjudicate which social meaning is historically verified; it only supplies materials, date, designer, and accession.`,
      epistemicStatus: 'INFERENCE',
      claimText: reader?.claim,
      readerId: handoff.readerId,
      sourceFields: ['agents.futurist.claim', 'agents.worker.claim', 'source.materials'],
      established: packet.archivalActor.establishedInPublicPacket,
      notEstablished: packet.archivalActor.notEstablishedInPublicPacket,
      steps: steps(
        'Claim selected',
        'Public packet loaded',
        'Contradiction compared',
        'Evidence boundary checked',
      ),
    };
  }

  if (questionId === 'source-field') {
    const refs = (reader?.evidence || [])
      .map((row) => row.sourceRef || row.text)
      .filter(Boolean);
    return {
      questionId,
      title: 'Source fields for the selected interpretation',
      body:
        refs.length > 0
          ? `The selected ${handoff.readerId} reading cites: ${refs.join('; ')}. A citation locates a packet field; it does not verify the interpretive leap.`
          : 'No supporting sourceRef rows are attached to this reading in the packet.',
      epistemicStatus: 'INFERENCE',
      claimText: reader?.claim,
      readerId: handoff.readerId,
      sourceFields: refs,
      established: packet.archivalActor.establishedInPublicPacket,
      notEstablished: packet.archivalActor.notEstablishedInPublicPacket,
      steps: steps('Claim selected', 'Cited field resolved', 'Evidence boundary checked'),
    };
  }

  if (questionId === 'what-unknown') {
    return {
      questionId,
      title: 'What remains unknown',
      body: `NOT ESTABLISHED in this public packet: ${packet.archivalActor.notEstablishedInPublicPacket.join('; ')}. Missing fields include: ${packet.source.missingFields.join(', ')}. Reader uncertainty: ${reader?.uncertainty || 'n/a'}`,
      epistemicStatus: 'NOT_ESTABLISHED',
      claimText: reader?.claim,
      readerId: handoff.readerId,
      sourceFields: ['archivalActor.notEstablishedInPublicPacket', 'source.missingFields'],
      established: packet.archivalActor.establishedInPublicPacket,
      notEstablished: packet.archivalActor.notEstablishedInPublicPacket,
      steps: steps('Public packet loaded', 'Evidence boundary checked', 'Research question returned'),
    };
  }

  if (questionId === 'what-would-change') {
    return {
      questionId,
      title: 'What evidence would change this claim',
      body: reader?.onsiteQuestion
        ? `Onsite question preserved from the packet: ${reader.onsiteQuestion}`
        : 'No onsite question is attached to this reading.',
      epistemicStatus: 'NOT_ESTABLISHED',
      claimText: reader?.claim,
      readerId: handoff.readerId,
      sourceFields: [`agents.${handoff.readerId}.onsiteQuestion`],
      established: packet.archivalActor.establishedInPublicPacket,
      notEstablished: packet.archivalActor.notEstablishedInPublicPacket,
      steps: steps('Claim selected', 'Research question returned'),
    };
  }

  if (questionId === 'after-encounter') {
    return {
      questionId,
      title: 'Institutional encounter status',
      body: 'NOT ESTABLISHED. No approved BEFORE / ENCOUNTER / AFTER revision has been recorded yet. The residency revision observatory remains empty until a verified institutional encounter is captured.',
      epistemicStatus: 'NOT_ESTABLISHED',
      claimText: reader?.claim,
      readerId: handoff.readerId,
      sourceFields: [],
      established: [],
      notEstablished: ['human-reviewed institutional revision'],
      steps: steps('Evidence boundary checked', 'Research question returned'),
    };
  }

  return {
    questionId: 'unsupported',
    title: 'Unsupported question',
    body: 'NOT ESTABLISHED. This console only answers the guided research questions against the approved public packet. Free-form historical questions are intentionally refused so the system cannot invent museum facts.',
    epistemicStatus: 'NOT_ESTABLISHED',
    sourceFields: [],
    established: [],
    notEstablished: ['arbitrary historical answer'],
    steps: steps('Evidence boundary checked', 'Unsupported request refused'),
  };
}

export function matchGuidedQuestion(text: string): string {
  const normalized = text.trim().toLowerCase();
  for (const question of GUIDED_QUESTIONS) {
    if (normalized === question.label.toLowerCase() || normalized === question.id) {
      return question.id;
    }
  }
  return 'unsupported';
}
