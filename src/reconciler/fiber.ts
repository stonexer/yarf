import { WorkTag, Key, Fiber } from '../types';

/**
 * Create a fiber node
 *
 * @param tag
 * @param pendingProps
 * @param key
 */
export function createFiberNode(
  tag: WorkTag,
  pendingProps: any,
  key: Key
): Fiber {
  return {
    tag,
    key,
    elementType: null,
    type: null,
    stateNode: null,

    return: null,
    child: null,
    sibling: null,
    index: 0,

    pendingProps,
    memoizedProps: null,

    alternate: null
  };
}

export function createFiberRoot(container: Element) {}
