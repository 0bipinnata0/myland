
export type Heap<T extends Node> = Array<T>;
type Node = {
  id: number,
  sortIndex: number,
};

export function peek<T extends Node>(heap: Heap<T>) {
  if (heap.length > 0) {
    return heap[0]
  }
  return null;
}

export function pop<T extends Node>(heap: Heap<T>): T | null {
  if (heap.length === 0) {
    return null;
  }
  const first = heap[0];
  const last = heap.pop()!;
  if (first === last) {
    return first;
  }
  heap[0] = last;
  siftDown(heap, last, 0)
  return first;
}

function compare<T extends Node>(l: T, r?: T) {
  if (!r) {
    return l;
  }
  return l.sortIndex < r.sortIndex ? l : r
}


function siftDown<T extends Node>(heap: Heap<T>, node: T, idx: number) {
  const length = heap.length;
  const l_idx = 2 * idx + 1;
  if (l_idx >= length) {
    heap[idx] = node
    return;
  }
  const left = heap[l_idx];
  const right = heap[l_idx + 1];
  const min = compare(left, right)
  if (node === compare(min, node)) {
    heap[idx] = node;
    return
  }
  heap[idx] = min;
  if (left === min) {
    siftDown(heap, node, l_idx)
  } else {
    siftDown(heap, node, l_idx + 1)
  }
}


export function push<T extends Node>(heap: Heap<T>, node: T) {
  heap.push(node);
  siftUp(heap, node, heap.length - 1);
}

function siftUp<T extends Node>(heap: Heap<T>, node: T, idx: number) {
  const return_idx = ((idx - 1) >> 1);
  const return_node = heap[return_idx];
  if (!return_node) {
    heap[idx] = node;
    return;
  } else if (compare(node, return_node) === return_node) {
    heap[idx] = node;
    return
  }
  heap[idx] = return_node;
  siftUp(heap, node, return_idx)
}

