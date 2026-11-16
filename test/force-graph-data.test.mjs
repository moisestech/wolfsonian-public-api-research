import test from 'node:test';
import assert from 'node:assert/strict';
import { focusedPairGraph } from '../src/force-graph-data.mjs';

test('the graph builder emits the focused pair and does not mark a historical relationship', () => {
  const graph = focusedPairGraph(
    [{ id: '2009.5.1', label: 'Delft Salad Oil' }, { id: '83.4.32', label: 'Neighbor' }, { id: '86.19.57', label: 'Other' }],
    [
      { source: '2009.5.1', target: '83.4.32', label: 'Labor' },
      { source: '2009.5.1', target: '86.19.57', label: 'Labor' },
      { source: '83.4.32', target: '86.19.57', label: 'Elsewhere' },
    ],
    '2009.5.1',
    '83.4.32'
  );
  const pair = graph.links.find(link => link.focused);
  assert.deepEqual([pair.source, pair.target], ['2009.5.1', '83.4.32']);
  assert.equal(graph.historicalRelationshipEstablished, false);
  assert.ok(graph.links.every(link => link.historicalRelationshipEstablished === false));
  assert.ok(graph.links.every(link => link.source === '2009.5.1' || link.target === '2009.5.1'));
  assert.equal(graph.links.some(link => link.source === '83.4.32' && link.target === '86.19.57'), false);
  assert.deepEqual(graph.nodes.filter(node => node.focused).map(node => node.id).sort(), ['2009.5.1', '83.4.32']);
});
