import { Fiber } from '../types';
import {
  createFiberFromElement,
  createWorkInProgress,
  createFiber,
  createFiberFromText
} from './fiber';
import * as EffectTag from '../shared/effectTag';

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

function deleteChild(returnFiber: Fiber, childToDelete: Fiber): void {
  const { lastEffect } = returnFiber;

  if (lastEffect !== null) {
    lastEffect.nextEffect = childToDelete;
    returnFiber.lastEffect = childToDelete;
  } else {
    returnFiber.firstEffect = returnFiber.lastEffect = childToDelete;
  }

  childToDelete.nextEffect = null;
  childToDelete.effectTag = EffectTag.Deletion;
}

function deleteRemainingChildren(
  returnFiber: Fiber,
  currentFirstFiber: Fiber | null
): void {
  let toDelete = currentFirstFiber;

  while (toDelete !== null) {
    deleteChild(returnFiber, toDelete);
    toDelete = toDelete.sibling;
  }
}

/**
 *
 * @param returnFiber
 * @param currentFirstChildFiber
 */
function mapRemainingChildren(
  returnFiber: Fiber,
  currentFirstChildFiber: Fiber | null
): Map<string | number, Fiber> {
  // string 可能是 key
  // number 可能是 index

  const existingChildren = new Map<string | number, Fiber>();

  let existingChild = currentFirstChildFiber;
  while (existingChild !== null) {
    if (existingChild.key !== null) {
      existingChildren.set(existingChild.key, existingChild);
    } else {
      existingChildren.set(existingChild.index, existingChild);
    }
    existingChild = existingChild.sibling;
  }

  return existingChildren;
}

/**
 * 放置 newFiber
 *
 * @param newFiber
 * @param lastPlacedIndex
 * @param newIndex
 */
function placeChild(
  newFiber: Fiber,
  lastPlacedIndex: number,
  newIndex: number
): number {
  newFiber.index = newIndex;
  const current = newFiber.alternate;

  if (current !== null) {
    const oldIndex = current.index;

    if (oldIndex < lastPlacedIndex) {
      // move
      newFiber.effectTag = EffectTag.Placement;
      return lastPlacedIndex;
    } else {
      return oldIndex;
    }
  } else {
    newFiber.effectTag = EffectTag.Placement;
    return lastPlacedIndex;
  }
}

function useFiber(fiber: Fiber, props: any): Fiber {
  let cloned = createWorkInProgress(fiber, props);
  // TODO:
  return cloned;
}

function updateElement(
  returnFiber: Fiber,
  current: Fiber | null,
  element: any
): Fiber {
  if (current !== null && current.elementType === element.type) {
    // 更新
    const existing = useFiber(current, element.props);
    existing.return = returnFiber;
    return existing;
  } else {
    // 插入
    const created = createFiberFromElement(element);
    created.return = returnFiber;
    return created;
  }
}

function updateTextNode(
  returnFiber: Fiber,
  current: Fiber | null,
  textContent: any
) {
  const created = createFiberFromText(textContent);
  created.return = returnFiber;
  return created;
}

/**
 * newChild + oldFiber => newFiber
 *
 * @param returnFiber
 * @param oldFiber
 * @param newChild
 */
function updateSlot(returnFiber: Fiber, oldFiber: Fiber | null, newChild: any) {
  const oldKey = oldFiber !== null ? oldFiber.key : null;

  if (typeof newChild === 'string') {
    return updateTextNode(returnFiber, oldFiber, newChild);
  }

  if (typeof newChild === 'object' && newChild !== null) {
    if (newChild.$$typeof === 'React.Element' && newChild.key === oldKey) {
      return updateElement(returnFiber, oldFiber, newChild);
    }
  }

  return null;
}

function updateFromMap(
  existingChildren: Map<string | number, Fiber>,
  returnFiber: Fiber,
  newIndex: number,
  newChild: any
): Fiber | null {
  const matchedFiber =
    existingChildren.get(newChild.key === null ? newIndex : newChild.key) ||
    null;

  return updateElement(returnFiber, matchedFiber, newChild);
}

function createChild(returnFiber: Fiber, newChild: any) {
  if (typeof newChild === 'string') {
    const created = createFiberFromText(newChild);
    created.return = returnFiber;
    return created;
  }

  if (typeof newChild === 'object' && newChild !== null) {
    if (newChild.$$typeof === 'React.Element') {
      const created = createFiberFromElement(newChild);
      created.return = returnFiber;
      return created;
    }
  }

  return null;
}

function reconcileChildFibers(
  returnFiber: Fiber,
  currentFirstChild: Fiber | null,
  newChild: any
): Fiber | null {
  if (typeof newChild === 'string') {
    return reconcileSingleElement(returnFiber, currentFirstChild, newChild);
  }
  return reconcileChildrenArray(
    returnFiber,
    currentFirstChild,
    Array.isArray(newChild) ? newChild : [newChild]
  );
}

function reconcileSingleElement(
  returnFiber: Fiber,
  currentFirstChild: Fiber | null,
  el: any
) {
  const created = createFiberFromElement(el);
  created.return = returnFiber;
  return created;
}

function reconcileChildrenArray(
  returnFiber: Fiber,
  currentFirstChild: Fiber | null,
  newChildren: Array<any>
) {
  /**
   * 需要返回的第一个 child fiber
   */
  let resultFirstChildFiber = null;

  /**
   * 上一个新建的 Fiber
   *
   * 用于创建上一个 Fiber 的 sibling 指针
   */
  let previousNewFiber = null;

  /**
   * Old Tree 上的指针
   */
  let oldFiber = currentFirstChild;

  /**
   * Old Tree 指针的“前缓冲”指针
   */
  let nextOldFiber = null;

  /**
   * 上一个新建的有效 Fiber 的插入位置
   */
  let lastPlacedIndex = 0;

  /**
   * 遍历 newCHildren 的 index
   */
  let newIndex = 0;

  // ** 第一次 遍历 **
  //
  // 处理 key 相同（或者没有 key）的情况，
  // 遍历 newChildren，按 index 依次更新
  // null 的节点会被 index 过滤掉
  for (; oldFiber !== null && newIndex < newChildren.length; newIndex++) {
    // 跳过 Old Tree 中原本是 null 的 "Fiber"
    if (oldFiber.index > newIndex) {
      nextOldFiber = oldFiber;
      oldFiber = null;
    } else {
      nextOldFiber = oldFiber.sibling;
    }

    // newChildren => 新 Fiber
    const newFiber = updateSlot(returnFiber, oldFiber, newChildren[newIndex]);

    // 新的 fiber 是 null
    if (newFiber === null) {
      if (oldFiber === null) {
        oldFiber = nextOldFiber;
      }
      /**
       * **放弃** 第一次遍历
       *
       * 可能是列表节点的顺序发生了变化，一对一遍历已经失去意义
       *
       * 这里需要优化，因为一种可能的情况是 newChildren 中新出现了一个 null
       * 此时是仍有可能可以在第一次遍历中完成调和的
       */
      break;
    }

    lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIndex);

    if (previousNewFiber === null) {
      resultFirstChildFiber = newFiber;
    } else {
      previousNewFiber.sibling = newFiber;
    }
    previousNewFiber = newFiber;

    oldFiber = nextOldFiber;
  }

  /**
   * **结束**
   * 1. 哈哈，第一次遍历就搞定了所有 newChildren
   */
  if (newIndex === newChildren.length) {
    /**
     * Old Tree 里如果有剩余没有处理的 Fiber，是肯定没有用的了。
     * 全部标记删除
     */
    deleteRemainingChildren(returnFiber, oldFiber);
    return resultFirstChildFiber;
  }

  /**
   * **结束**
   * 2. 还有剩余的 newChildren，但是 Old Tree 已经处理完了
   */
  if (oldFiber === null) {
    /**
     * 剩余的 newChildren 全部标记创建
     */
    for (; newIndex < newChildren.length; newIndex++) {
      const newFiber = createChild(returnFiber, newChildren[newIndex]);

      if (newFiber === null) {
        continue;
      }

      lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIndex);

      if (previousNewFiber === null) {
        resultFirstChildFiber = newFiber;
      } else {
        previousNewFiber.sibling = newFiber;
      }
      previousNewFiber = newFiber;
    }
  }

  /**
   * **结束**
   * 3. newChildren 和 Old Tree 都有剩余
   * 用 key 和 index 对比更新
   */
  const existingChildren = mapRemainingChildren(returnFiber, oldFiber);

  for (; newIndex < newChildren.length; newIndex++) {
    const newFiber = updateFromMap(
      existingChildren,
      returnFiber,
      newIndex,
      newChildren[newIndex]
    );

    if (newFiber !== null) {
      if (newFiber.alternate !== null) {
        // 该 Fiber 是一次 reuse
        existingChildren.delete(
          newFiber.key === null ? newIndex : newFiber.key
        );
      }
      lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIndex);

      if (previousNewFiber === null) {
        resultFirstChildFiber = newFiber;
      } else {
        previousNewFiber.sibling = newFiber;
      }
      previousNewFiber = newFiber;
    }
  }

  // 将剩余的节点标记删除
  existingChildren.forEach((child) => {
    deleteChild(returnFiber, child);
  });

  return resultFirstChildFiber;
}
