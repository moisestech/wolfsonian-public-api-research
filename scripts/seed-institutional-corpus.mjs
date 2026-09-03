#!/usr/bin/env node
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const prep =
  'Public-record packet manually prepared from Wolfsonian sources while automated API connectivity remains under investigation.';
const retrieved = '2026-09-02';

const seeds = [
  {
    id: 'WOLF-001',
    slug: 'trylon-perisphere',
    cluster: 'utopia',
    institution: 'The Wolfsonian–FIU',
    title: 'Model, Trylon and Perisphere',
    accessionNumber: '86.17.1',
    bibId: null,
    date: 'c. 1938',
    creator: ['Wallace K. Harrison', 'Jacques André Fouilhoux'],
    materials: ['stainless steel', 'plastic', 'wood'],
    subjects: ["World's Fairs", 'technological optimism', 'architecture'],
    dimensions: '36 1/4 × 31 in. diameter',
    collection: 'The Mitchell Wolfson, Jr. Collection',
    source_urls: [
      'https://wolfsonian.org/whats-on/exhibitions+installations/2025/05/worlds-fairs-visions-of-tomorrow.html',
      'https://wolfsonian.org/_assets/docs/checklist_worlds-fairs.pdf'
    ],
    source_text: [
      'Presentation model of the Theme Center for the 1939 New York World\'s Fair.',
      'Architects Harrison & Fouilhoux; stainless steel, plastic, wood.'
    ],
    missing_fields: ['bibId', 'fabricator', 'ownership_history'],
    archival_knows: ['title', 'date', 'architects', 'materials', 'dimensions', 'accession', 'collection'],
    archival_does_not_know: ['who fabricated each part', 'tour history', 'visitor affective response'],
    representation: {
      type: 'original-svg',
      src: '../assets/objects/trylon-perisphere.svg',
      caption: 'Original diagram: Trylon and Perisphere geometry'
    }
  },
  {
    id: 'WOLF-002',
    slug: 'sparton-radio',
    cluster: 'media',
    institution: 'The Wolfsonian–FIU',
    title: 'Radio, Sparton, model 558-C',
    accessionNumber: 'XX1990.1484',
    bibId: null,
    date: '1937',
    creator: ['Walter Dorwin Teague'],
    materials: ['glass', 'brass', 'wood', 'Bakelite'],
    subjects: ['industrial design', 'streamlining', 'domestic technology', 'mass media'],
    dimensions: null,
    collection: 'The Mitchell Wolfson, Jr. Collection',
    source_urls: ['https://wolfsonian.org/whats-on/digital-experiences/designing-deco/'],
    source_text: [
      'Sparton model 558-C radio designed by Walter Dorwin Teague.',
      'Museum interpretation notes horizontal streamlining as creating a sense of speed.'
    ],
    missing_fields: ['bibId', 'dimensions', 'broadcast_history', 'owner'],
    archival_knows: ['title', 'date', 'designer', 'manufacturer context', 'materials', 'accession'],
    archival_does_not_know: ['who owned me', 'how I was used', 'how listeners felt', 'component labor'],
    representation: {
      type: 'original-svg',
      src: '../assets/objects/sparton-radio.svg',
      caption: 'Original diagram: streamlined radio silhouette'
    }
  },
  {
    id: 'WOLF-003',
    slug: 'machine-age-catalogue',
    cluster: 'machine-ideology',
    institution: 'The Wolfsonian–FIU',
    title: 'Catalogue, Machine Age Exposition',
    accessionNumber: 'XM1999.108.8',
    bibId: null,
    date: '1927',
    creator: ['Fernand Léger'],
    materials: [],
    subjects: ['modernism', 'mechanical beauty', 'industrial design', 'architecture'],
    dimensions: '11 × 8 3/4 in.',
    collection: 'The Mitchell Wolfson, Jr. Collection',
    source_urls: ['https://wolfsonian.org/_assets/docs/checklist_modern-design-across-borders.pdf'],
    source_text: [
      '1927 Machine Age Exposition catalogue with cover by Fernand Léger.',
      'Checklist notes modernist ideas, streamlined forms, and mechanical beauty.'
    ],
    missing_fields: ['bibId', 'materials', 'full_essay_text'],
    archival_knows: ['title', 'date', 'cover designer', 'dimensions', 'accession'],
    archival_does_not_know: ['reader annotations', 'complete essay contents in this packet', 'labor behind exhibited machines'],
    representation: {
      type: 'original-svg',
      src: '../assets/objects/machine-age-catalogue.svg',
      caption: 'Original diagram: catalogue as machine-geometry page'
    }
  },
  {
    id: 'WOLF-004',
    slug: 'mappemonde-vase',
    cluster: 'world-making',
    institution: 'The Wolfsonian–FIU',
    title: 'Vase with lid, Mappemonde [Globe]',
    accessionNumber: '85.7.383a,b',
    bibId: null,
    date: '1932',
    creator: ['Henri Rapin', 'Victor Menu', 'Adrien Leduc'],
    materials: ['glazed soft stoneware'],
    subjects: ['world fairs', 'colonial display', 'national manufacture', 'exploration imagery'],
    dimensions: null,
    collection: 'The Mitchell Wolfson, Jr. Collection',
    source_urls: ['https://wolfsonian.org/whats-on/digital-experiences/designing-deco/'],
    source_text: [
      'Mappemonde vase from Sèvres, associated with world-fair / exposition culture of national display.',
      'Museum interpretation connects imagery to a colonialist conception of exploration and progress.'
    ],
    missing_fields: ['bibId', 'dimensions', 'commissioning_context_detail'],
    archival_knows: ['title', 'date', 'designers/decorator', 'manufacturer', 'material', 'accession'],
    archival_does_not_know: ['specific exhibition placement', 'period reception', 'whose labor decorated each zone'],
    representation: {
      type: 'original-svg',
      src: '../assets/objects/mappemonde-vase.svg',
      caption: 'Original diagram: globe-vase geometry'
    }
  },
  {
    id: 'WOLF-005',
    slug: 'poster-in-1939',
    cluster: 'utopia',
    institution: 'The Wolfsonian–FIU',
    title: 'Poster, In 1939: The New York World’s Fair',
    accessionNumber: '85.4.72',
    bibId: null,
    date: '1937',
    creator: ['Nembhard N. Culin'],
    materials: ['offset lithograph'],
    subjects: ["World's Fairs", 'publicity', 'Trylon and Perisphere', 'persuasion'],
    dimensions: '39 3/4 × 28 in.',
    collection: 'The Mitchell Wolfson, Jr. Collection',
    source_urls: ['https://wolfsonian.org/_assets/docs/checklist_worlds-fairs.pdf'],
    source_text: [
      'Poster offering a bird\'s-eye night view of visitors lining up for the Trylon and Perisphere.',
      'Published two years before the fair; designed by Nembhard N. Culin.'
    ],
    missing_fields: ['bibId', 'print_run', 'distribution_channels'],
    archival_knows: ['title', 'date', 'designer', 'publisher', 'medium', 'dimensions', 'accession'],
    archival_does_not_know: ['audience demographics', 'conversion to attendance', 'censored alternatives'],
    representation: {
      type: 'original-svg',
      src: '../assets/objects/poster-in-1939.svg',
      caption: 'Original diagram: fair publicity poster frame'
    }
  },
  {
    id: 'WOLF-006',
    slug: 'program-world-of-tomorrow',
    cluster: 'utopia',
    institution: 'The Wolfsonian–FIU',
    title: 'Program, Your World of Tomorrow',
    accessionNumber: '86.19.57',
    bibId: null,
    date: '1939',
    creator: ['Leslie Darrell Ragan', 'Gilbert Vivian Seldes'],
    materials: [],
    subjects: ['Democracity', 'utopia', 'urban planning', "World's Fairs"],
    dimensions: '11 3/4 × 17 3/4 in. open',
    collection: 'The Mitchell Wolfson, Jr. Collection',
    source_urls: ['https://wolfsonian.org/_assets/docs/checklist_worlds-fairs.pdf'],
    source_text: [
      'Program related to the Trylon and Perisphere Theme Center.',
      'Checklist describes Democracity as an imagined futurescape shaped by peaceful commerce.'
    ],
    missing_fields: ['bibId', 'materials', 'complete_program_text'],
    archival_knows: ['title', 'date', 'cover illustrator', 'author', 'accession', 'theme-center context'],
    archival_does_not_know: ['full visitor script', 'excluded populations in Democracity narrative'],
    representation: {
      type: 'original-svg',
      src: '../assets/objects/program-tomorrow.svg',
      caption: 'Original diagram: program spread mark'
    }
  },
  {
    id: 'WOLF-007',
    slug: 'booklet-futurama',
    cluster: 'utopia',
    institution: 'The Wolfsonian–FIU',
    title: 'Booklet, Futurama',
    accessionNumber: 'XB1992.1640',
    bibId: null,
    date: '1940',
    creator: ['General Motors Corporation'],
    materials: [],
    subjects: ['Futurama', 'automobility', 'corporate utopia', 'highways'],
    dimensions: '7 × 8 1/4 in. closed',
    collection: 'The Mitchell Wolfson, Jr. Collection',
    source_urls: ['https://wolfsonian.org/_assets/docs/checklist_worlds-fairs.pdf'],
    source_text: [
      'General Motors Futurama booklet.',
      'Checklist notes Norman Bel Geddes’s exhibit vision of an egalitarian America in 1960 with automobiles for all.'
    ],
    missing_fields: ['bibId', 'materials', 'designer_credit_on_object_record'],
    archival_knows: ['title', 'date', 'publisher', 'accession', 'Futurama exhibit context'],
    archival_does_not_know: ['labor that built the diorama', 'who was excluded from “automobiles for all”'],
    representation: {
      type: 'original-svg',
      src: '../assets/objects/futurama-booklet.svg',
      caption: 'Original diagram: Futurama booklet mark'
    }
  },
  {
    id: 'WOLF-008',
    slug: 'rca-television-trk12',
    cluster: 'media',
    institution: 'The Wolfsonian–FIU',
    title: 'Television, RCA Victor TRK 12',
    accessionNumber: '2012.6.1',
    bibId: null,
    date: '1939',
    creator: ['John Vassos'],
    materials: ['walnut', 'beech', 'ebonized veneer', 'Bakelite', 'glass', 'metal'],
    subjects: ['television', 'domestic technology', 'streamlining', "World's Fairs"],
    dimensions: '40 × 34 × 20 1/2 in.',
    collection: null,
    source_urls: ['https://wolfsonian.org/_assets/docs/checklist_worlds-fairs.pdf'],
    source_text: [
      'RCA Victor TRK 12 television designed by John Vassos; unveiled in consumer context at the New York World\'s Fair.',
      'Checklist notes design intended to read as furniture rather than bare mechanism when not in use.'
    ],
    missing_fields: ['bibId', 'broadcast_receiver_history', 'owner'],
    archival_knows: ['title', 'date', 'designer', 'manufacturer', 'materials', 'dimensions', 'accession'],
    archival_does_not_know: ['household use', 'who watched', 'maintenance labor', 'signal politics'],
    representation: {
      type: 'original-svg',
      src: '../assets/objects/rca-television.svg',
      caption: 'Original diagram: early television cabinet'
    }
  }
].map((seed) => ({
  ...seed,
  preparation: prep,
  retrieved_at: retrieved,
  research_status: 'public-record-only'
}));

const interpretations = {
  'WOLF-001': {
    packet_id: 'WOLF-001',
    entities: [
      { label: 'Theme Center', kind: 'concept', relation: 'depicts' },
      { label: 'World of Tomorrow', kind: 'concept', relation: 'promises' }
    ],
    relationships: [
      { from: 'record:WOLF-001', to: 'progress', type: 'figures' },
      { from: 'record:WOLF-001', to: 'record:WOLF-005', type: 'icon_shared_with' }
    ],
    possible_pressures: ['progress', 'spectacle', 'hope'],
    open_questions: ['What does the physical model reveal that publicity images flatten?'],
    requires_physical_inspection: ['seams', 'fasteners', 'backside labels', 'wear']
  },
  'WOLF-002': {
    packet_id: 'WOLF-002',
    entities: [
      { label: 'streamlining', kind: 'concept', relation: 'styled_as' },
      { label: 'domestic receiver', kind: 'concept', relation: 'functions_as' }
    ],
    relationships: [
      { from: 'record:WOLF-002', to: 'desire', type: 'converts_technology_into' },
      { from: 'record:WOLF-002', to: 'record:WOLF-008', type: 'precedes_medium_of' }
    ],
    possible_pressures: ['comfort', 'desire', 'speed', 'domestication'],
    open_questions: ['How did styling make mass media feel safe at home?'],
    requires_physical_inspection: ['knobs', 'grille wear', 'repairs', 'mirror condition']
  },
  'WOLF-003': {
    packet_id: 'WOLF-003',
    entities: [
      { label: 'mechanical beauty', kind: 'concept', relation: 'teaches' },
      { label: 'Machine Age', kind: 'concept', relation: 'names' }
    ],
    relationships: [
      { from: 'record:WOLF-003', to: 'labor', type: 'aestheticizes_or_occludes' },
      { from: 'record:WOLF-003', to: 'progress', type: 'manifestos' }
    ],
    possible_pressures: ['progress', 'obedience', 'taste', 'industrial force'],
    open_questions: ['Where does the catalogue show labor versus pure form?'],
    requires_physical_inspection: ['paper', 'annotations', 'image hierarchy', 'essay order']
  },
  'WOLF-004': {
    packet_id: 'WOLF-004',
    entities: [
      { label: 'colonial display', kind: 'concept', relation: 'participates_in' },
      { label: 'national manufacture', kind: 'concept', relation: 'demonstrates' }
    ],
    relationships: [
      { from: 'record:WOLF-004', to: 'progress', type: 'maps_as' },
      { from: 'exploration', to: 'governance', type: 'entangles_with' }
    ],
    possible_pressures: ['progress', 'exploration', 'governance', 'beauty'],
    open_questions: ['How does decorative geography encode power?'],
    requires_physical_inspection: ['lid relationship', 'surface zones', 'maker marks']
  },
  'WOLF-005': {
    packet_id: 'WOLF-005',
    entities: [
      { label: 'fair publicity', kind: 'concept', relation: 'is' },
      { label: 'queue of desire', kind: 'concept', relation: 'depicts' }
    ],
    relationships: [
      { from: 'record:WOLF-005', to: 'record:WOLF-001', type: 'advertises' },
      { from: 'record:WOLF-005', to: 'desire', type: 'organizes' }
    ],
    possible_pressures: ['desire', 'spectacle', 'progress'],
    open_questions: ['What does night-time spectacle omit about daytime labor at the fair?'],
    requires_physical_inspection: ['print quality', 'cropping', 'color aging']
  },
  'WOLF-006': {
    packet_id: 'WOLF-006',
    entities: [
      { label: 'Democracity', kind: 'concept', relation: 'describes' },
      { label: 'regulated utopia', kind: 'concept', relation: 'imagines' }
    ],
    relationships: [
      { from: 'record:WOLF-006', to: 'record:WOLF-001', type: 'interprets_interior_of' },
      { from: 'record:WOLF-006', to: 'progress', type: 'scripts' }
    ],
    possible_pressures: ['progress', 'order', 'commerce', 'peace'],
    open_questions: ['Who is outside Democracity’s peaceful commerce?'],
    requires_physical_inspection: ['full spread', 'typography', 'omitted pages']
  },
  'WOLF-007': {
    packet_id: 'WOLF-007',
    entities: [
      { label: 'Futurama', kind: 'concept', relation: 'documents' },
      { label: 'automobility for all', kind: 'concept', relation: 'promises' }
    ],
    relationships: [
      { from: 'record:WOLF-007', to: 'progress', type: 'corporatizes' },
      { from: 'record:WOLF-007', to: 'labor', type: 'backgrounds' }
    ],
    possible_pressures: ['progress', 'mobility', 'consumption', 'planning'],
    open_questions: ['What labor produced the diorama that sold freedom as highways?'],
    requires_physical_inspection: ['booklet wear', 'image captions', 'corporate voice']
  },
  'WOLF-008': {
    packet_id: 'WOLF-008',
    entities: [
      { label: 'television as furniture', kind: 'concept', relation: 'domesticates' },
      { label: 'broadcast modernity', kind: 'concept', relation: 'introduces' }
    ],
    relationships: [
      { from: 'record:WOLF-008', to: 'record:WOLF-002', type: 'extends_domestication_of' },
      { from: 'record:WOLF-008', to: 'desire', type: 'furnitureizes' }
    ],
    possible_pressures: ['comfort', 'desire', 'domestication', 'authority'],
    open_questions: ['How does furniture form recruit trust for a new medium?'],
    requires_physical_inspection: ['cabinet joinery', 'screen condition', 'control layout']
  }
};

async function main() {
  const seedDir = join(root, 'data', 'public', 'objects');
  const interpDir = join(root, 'data', 'research', 'interpretations');
  await mkdir(seedDir, { recursive: true });
  await mkdir(interpDir, { recursive: true });
  for (const seed of seeds) {
    await writeFile(join(seedDir, `${seed.id}.json`), `${JSON.stringify(seed, null, 2)}\n`);
    await writeFile(
      join(interpDir, `${seed.id}.json`),
      `${JSON.stringify(interpretations[seed.id], null, 2)}\n`
    );
  }
  console.log(`Wrote ${seeds.length} seeds and interpretations`);
}

main();
