import test from 'node:test';
import assert from 'node:assert/strict';
import { linkedListDrawing, composeBoardSource } from '../src/lib/linked-list-drawing.js';

test('recognizes only complete integer-chain drawings without guessing missing or branched links', () => {
  assert.equal(linkedListDrawing('1->3->4->5'), '1->3->4->5');
  assert.equal(linkedListDrawing(' -2 → 0 -> +4 -> -2\n'), '-2->0->4->-2');
  for (const text of ['1', '1 3 4 5', '1->', '1->3; puts("x");', 'a->next', '1->2\n1->3', '1->2147483648', '1->-2147483649']) assert.equal(linkedListDrawing(text), null);
});

test('drawing programs invoke the library constructor and preserve the language', () => {
  const source = '1->3->4->5';
  const full = composeBoardSource(source);
  assert.equal(full.drawing, source);
  assert.match(full.source, /list_from_arrows\(&list, "1->3->4->5"\)/);
  assert.match(full.source, /list_free\(&list\)/);
  assert.equal(composeBoardSource(source, 'c').source, full.source);
  assert.equal(composeBoardSource(source, 'python').source, source);
  assert.equal(composeBoardSource('int main(void) { return 0; }').drawing, null);
});
