import { Fiber, ReactElement } from './types';

// 当前工作中的 fiber
let workInProgress: Fiber | null = null;

function workLoopSync() {
  while (workInProgress !== null) {
    workInProgress = performUnitOfWork(workInProgress);
  }
}

function performUnitOfWork(unitOfWork: Fiber): Fiber | null {
  const current = unitOfWork.alternate;
  const next = beginWork(current, unitOfWork);
  return next;
}

function beginWork(current: Fiber | null, wip: Fiber) {
  // TODO: 处理 current fiber

  switch (wip.tag) {
    default: {
      return updateHostComponent(current, wip);
    }
  }
}

function updateHostComponent(current: Fiber | null, wip: Fiber) {
  const nextProps = wip.pendingProps;
  const prevProps = current !== null ? current.memoizedProps : null;

  let nextChildren = nextProps.children;

  reconcileChildren(current, wip, nextChildren);

  return wip.child;
}

function reconcileChildren(
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
  let oldFiber = currentFirstChild;
  let nextOldFiber = null;
  let newIndex = 0;
  for (; oldFiber !== null && newIndex < newChildren.length; newIndex++) {
    if (oldFiber.index > newIndex) {
      nextOldFiber = oldFiber;
      oldFiber = null;
    } else {
      nextOldFiber = oldFiber.sibling;
    }
  }
}
