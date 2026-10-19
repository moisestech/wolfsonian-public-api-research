export type EpistemicStatus = 'ESTABLISHED' | 'INFERENCE' | 'NOT_ESTABLISHED';

export type PacketAgent = {
  observation: string;
  claim: string;
  evidence: { text: string; sourceRef?: string }[];
  contradicts: string[];
  uncertainty: string;
  onsiteQuestion: string;
};

export type PublicPacket = {
  id: string;
  seedId: string;
  source: {
    title: string;
    accessionNumber: string;
    date: string;
    creator: string;
    materials: string;
    publicRecordUrl: string;
    citedAt: string;
    missingFields: string[];
  };
  archivalActor: {
    establishedInPublicPacket: string[];
    notEstablishedInPublicPacket: string[];
  };
  agents: Record<string, PacketAgent>;
};

export type ExecutionStep = {
  id: string;
  label: string;
  status: 'completed';
};

export type ResearchAnswer = {
  questionId: string;
  title: string;
  body: string;
  epistemicStatus: EpistemicStatus;
  claimText?: string;
  readerId?: string;
  sourceFields: string[];
  established: string[];
  notEstablished: string[];
  steps: ExecutionStep[];
};
