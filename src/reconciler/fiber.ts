import { WorkTag, Key, Fiber, FiberRoot, VNode } from '../types';

/**
 * Create a fiber node
 *
 * @param tag
 * @param pendingProps
 * @param key
 */
export function createFiber(tag: WorkTag, pendingProps: any, key: Key): Fiber {
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

    alternate: null,

    updateQueue: null
  };
}

export function createFiberRoot(container: Element): FiberRoot {
  const root = { containerInfo: container } as FiberRoot;

  const fiber = createFiber(WorkTag.HostRoot, null, null);
  root.current = fiber;
  fiber.stateNode = root;

  return root;
}

export function createWorkInProgress(current: Fiber, pendingProps: any) {
  let workInProgress = current.alternate;

  if (workInProgress === null) {
    workInProgress = createFiber(current.tag, pendingProps, current.key);
    workInProgress.elementType = current.elementType;
    workInProgress.stateNode = current.stateNode;

    workInProgress.alternate = current;
    current.alternate = workInProgress;
  } else {
    workInProgress.pendingProps = pendingProps;
  }

  workInProgress.child = current.child;
  workInProgress.memoizedProps = current.memoizedProps;

  workInProgress.sibling = current.sibling;
  workInProgress.index = current.index;

  return workInProgress;
}

export function createFiberFromElement(el: VNode): Fiber | null {
  if (el === null) {
    return null;
  }

  let fiber: Fiber;
  if (typeof el.type === 'string') {
    fiber =
  }
}
