/** Artist-authored, source-bounded scenes. Not historical testimony. */

export const SCRIPTED_SCENES = Object.freeze([
  {
    sceneId: 'sparton-domestic',
    title: 'Sparton / domestic modernity',
    sourceObjectIds: ['WOLF-002'],
    disclaimer: 'SCRIPTED. First-person speech is a theatrical construct, not a historic quotation.',
    turns: [
      { speaker: 'Futurist', kind: 'ARTIST-AUTHORED', knowledgeStatus: 'INTERPRETATION', text: 'The silhouette makes modern media look desirable inside a home. That is a reading of the form, not a household history.' },
      { speaker: 'Worker', kind: 'ARTIST-AUTHORED', knowledgeStatus: 'INTERPRETATION', text: 'Who cut, shipped, maintained, or repaired it? The public packet does not name that labor.' },
      { speaker: 'Archivist', kind: 'CATALOG', knowledgeStatus: 'ESTABLISHED', text: 'The public packet names the title, accession XX1990.1484, designer Walter Dorwin Teague, date 1937, and materials. It does not establish how one household listened.', citedFields: ['title', 'accessionNumber', 'creator', 'date', 'materials'] },
    ],
    unansweredQuestion: 'What would a manual, an advertising campaign, or an object-care record change?',
  },
  {
    sceneId: 'machine-age-text',
    title: 'Machine Age catalogue / text versus inference',
    sourceObjectIds: ['WOLF-003'],
    disclaimer: 'SCRIPTED. No page-level quotation is invented.',
    turns: [
      { speaker: 'Archivist', kind: 'CATALOG', knowledgeStatus: 'ESTABLISHED', text: 'The public packet identifies the Machine Age Exposition catalogue, accession XM1999.108.8. It does not quote the essays or captions.', citedFields: ['title', 'accessionNumber'] },
      { speaker: 'Archivist', kind: 'UNKNOWN', knowledgeStatus: 'NOT ESTABLISHED', text: 'Those pages have to be consulted before anyone asserts what the text promises. This is a library consultation, not a generated quotation.' },
    ],
    unansweredQuestion: 'Which caption or essay, read from the object, would change this inference?',
  },
  {
    sceneId: 'box-versus-accession',
    title: 'Box versus accession / two maps',
    sourceObjectIds: ['WOLF-002'],
    disclaimer: 'SCRIPTED. No box number is invented.',
    turns: [
      { speaker: 'Archivist', kind: 'ARTIST-AUTHORED', knowledgeStatus: 'ESTABLISHED', text: 'The accession names a catalog unit. A container would organize physical care. Those are different maps.' },
      { speaker: 'Archivist', kind: 'UNKNOWN', knowledgeStatus: 'NOT ESTABLISHED', text: 'Box identifiers exist in Lakehouse. This public view has no authorized box-to-accession mapping loaded, so no storage line is drawn.' },
    ],
    unansweredQuestion: 'Which authorized box-to-accession pair, if any, should be displayed?',
  },
]);

export function sceneForObject(objectId) {
  return SCRIPTED_SCENES.find(scene => scene.sourceObjectIds.includes(objectId)) || null;
}
