// Interpret only an entire, unbranched integer chain, never C++ expressions/code.
export function linkedListDrawing(source) {
  if (typeof source !== 'string' || source.length > 8192 ||
      !/^\s*[+-]?\d+\s*(?:(?:->|→)\s*[+-]?\d+\s*)+$/.test(source)) return null;
  const values = source.trim().split(/\s*(?:->|→)\s*/).map(Number);
  if (values.some(value => !Number.isInteger(value) || value < -2147483648 || value > 2147483647)) return null;
  return values.join('->');
}

export function linkedListProgram(drawing) {
  return `#include <stdio.h>
#include <linked_list.h>

int main() {
    LinkedList list;
    list_init(&list);
    if (!list_from_arrows(&list, ${JSON.stringify(drawing)})) {
        fputs("Invalid linked-list drawing.\\n", stderr);
        list_free(&list);
        return 1;
    }
    for (const ListNode *node = list.head; node; node = node->next) {
        printf("%d%s", node->value, node->next ? "->" : "\\n");
    }
    list_free(&list);
    return 0;
}`;
}

// A drawn integer chain becomes a real linked list; every other text is returned unchanged.
export function composeBoardSource(source, language = 'c') {
  const drawing = language === 'c' ? linkedListDrawing(source) : null;
  return drawing === null ? { source, drawing: null } : { source: linkedListProgram(drawing), drawing };
}
