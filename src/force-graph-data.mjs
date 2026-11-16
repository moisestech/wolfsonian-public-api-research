/** Links for one conversation. A shared tag is not a historical relationship. */

export function focusedPairGraph(nodes, links, sourceId = '', targetId = '') {
  const graphLinks = [];
  for (const link of links || []) {
    const source = link.source;
    const target = link.target;
    if (!source || !target) continue;
    if (sourceId && source !== sourceId && target !== sourceId) continue;
    const focused = Boolean(sourceId && targetId && ((source === sourceId && target === targetId) || (source === targetId && target === sourceId)));
    graphLinks.push({
      source,
      target,
      focused,
      label: link.label || '',
      color: link.color || '',
      historicalRelationshipEstablished: false,
    });
  }
  if (sourceId && targetId && !graphLinks.some(link => link.focused)) {
    graphLinks.unshift({
      source: sourceId,
      target: targetId,
      focused: true,
      label: '',
      historicalRelationshipEstablished: false,
    });
  }
  const graphNodes = (nodes || []).map(node => ({
    ...node,
    id: node.id,
    label: node.label || node.id,
    focused: Boolean(sourceId && targetId && (node.id === sourceId || node.id === targetId)),
  }));
  return { nodes: graphNodes, links: graphLinks, historicalRelationshipEstablished: false };
}
