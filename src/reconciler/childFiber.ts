import { Fiber } from '../types';
import { createFiberFromElement } from './fiber';

export function reconcileChildren(
  current: Fiber | null,
  wip: Fiber,
  nextChildren: any
) {
  wip.child = reconcileChildFibers(
    wip,
    current !== null ? current.child : current,
    nextChildren
  );
}

function updateElement(
  returnFiber: Fiber,
  current: Fiber | null,
  element: any
) {
  if (current !== null && current.elementType === element.type) {
    // 更新
  } else {
    // 插入
    const created = createFiberFromElement(element);
    created.return = returnFiber;

    return created;
  }
}

function updateSlot(returnFiber: Fiber, oldFiber: Fiber | null, newChild: any) {
  const oldKey = oldFiber !== null ? oldFiber.key : null;

  if (typeof newChild === 'object' && newChild !== null) {
    if (newChild.$$typeof === 'React.Element' && newChild.key === oldKey) {
      return updateElement(returnFiber, oldFiber, newChild);
    }
  }

  return null;
}

function reconcileChildFibers(
  returnFiber: Fiber,
  currentFirstChild: Fiber | null,
  newChild: any
): Fiber | null {
  return reconcileChildrenArray(returnFiber, currentFirstChild, newChild);
}

function reconcileChildrenArray(
  returnFiber: Fiber,
  currentFirstChild: Fiber | null,
  newChildren: Array<any>
) {
  // ** 第一次 遍历 **
  //
  // 处理 key 相同（或者没有 key）的情况
  // 遍历 newChildren，按 index 依次更新
  // null 的节点会被 index 过滤掉
  let oldFiber = currentFirstChild;
  let nextOldFiber = null;
  let newIndex = 0;
  for (; oldFiber !== null && newIndex < newChildren.length; newIndex++) {
    // 如果 old 树上对应 index 的节点不存在，nextOld 指针保持不动，否则前进
    if (oldFiber.index > newIndex) {
      nextOldFiber = oldFiber;
      oldFiber = null;
    } else {
      nextOldFiber = oldFiber.sibling;
    }

    const newFiber = updateSlot(returnFiber, oldFiber, newChildren[newIndex]);
  }
}
