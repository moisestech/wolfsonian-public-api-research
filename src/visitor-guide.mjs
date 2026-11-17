/**
 * Plain-language, source-aware visitor copy. This never upgrades a staff
 * metadata overlap into a historical relationship or invents a catalog field.
 */
function safe(value) { return String(value ?? '').trim().replace(/\s+/g, ' '); }
export function visitorGuide(record, edge, { visibleCount = 0 } = {}) {
  const title = safe(record?.title);
  const accession = safe(record?.accession);
  const source = record?.source || '';
  const demo = source === 'invented' || accession.startsWith('FICTION-');
  const kind = demo ? 'FICTIONAL EXAMPLE'
    : source === 'lakehouse' ? 'SAVED CATALOG + STAFF TAGS'
    : source === 'local-csv' ? 'LOCALLY IMPORTED RESEARCH'
    : 'RESEARCH VIEW · SOURCE STATUS TO CONFIRM';
  const label = title || 'Choose an object';
  const reason = edge?.reasons?.[0];
  const concept = safe(reason?.value);
  const family = safe(reason?.family);
  const hasConnection = Boolean(edge?.target && concept);
  const line = hasConnection
    ? 'Connected through the shared ' + (family === 'motif' ? 'symbol' : family === 'theme' ? 'theme' : 'recorded tag') + ' “' + concept + '”. It is a clue to explore, not proof that these objects met.'
    : 'No shared-tag conversation is selected. Choose a different object or theme to explore.';
  const subtitle = demo
    ? 'This is an invented practice example, not a Wolfsonian collection record.'
    : source === 'lakehouse'
      ? 'Catalog title and identifier come from a saved, partial lookup; connections are calculated from separate staff tags.'
      : 'These are research inputs. Check original records and image rights before sharing.';
  return Object.freeze({
    title: label,
    accession,
    kind,
    line,
    subtitle,
    hasConnection,
    badge: visibleCount > 0 ? visibleCount + ' objects in this view' : 'No objects in this view',
    ctaLabel: hasConnection ? 'Listen to this conversation' : 'Choose another connection',
  });
}
