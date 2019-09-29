import { WorkTag, Key, Fiber, FiberRoot, VNode } from '../types';
import { NoEffect } from '../shared/effectTag';

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

    updateQueue: null,

    effectTag: NoEffect,

    nextEffect: null,
    firstEffect: null,
    lastEffect: null
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

    workInProgress.effectTag = NoEffect;

    workInProgress.nextEffect = null;
    workInProgress.firstEffect = null;
    workInProgress.lastEffect = null;
  }

  workInProgress.child = current.child;
  workInProgress.memoizedProps = current.memoizedProps;
  workInProgress.updateQueue = current.updateQueue;

  workInProgress.sibling = current.sibling;
  workInProgress.index = current.index;

  return workInProgress;
}

export function createFiberFromElement(el: VNode): Fiber {
  let fiber: Fiber | null = null;

  if (typeof el.type === 'string') {
    fiber = createFiber(WorkTag.HostComponent, el.props, el.key);
  } else if (typeof el.$$typeof === 'function') {
    fiber = createFiber(WorkTag.FunctionComponent, el.props, el.key);
  } else {
    // TODO:
    fiber = createFiber(WorkTag.FunctionComponent, el.props, el.key);
  }

  fiber.type = el.type;
  fiber.elementType = el.type;

  return fiber;
}

export function createFiberFromText(content: any) {
  const fiber = createFiber(WorkTag.HostText, content, null);
  return fiber;
}
