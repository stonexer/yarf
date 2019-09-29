import { Fiber, WorkTag, FiberRoot } from '../types';
import { createWorkInProgress } from './fiber';
import { beginWork } from './beginWork';
import { PerformedWork } from '../shared/effectTag';
import { completeWork } from './completeWork';

let workInProgress: Fiber | null;

export function scheduleWork(fiber: Fiber) {
  const root = fiberToRoot(fiber);

  if (root === null) {
    throw new Error('Root is null');
  }

  performSyncWorkOnRoot(root);
}

function fiberToRoot(fiber: Fiber): FiberRoot {
  if (
    fiber !== null &&
    fiber.tag === WorkTag.HostRoot &&
    fiber.return === null
  ) {
    return fiber.stateNode;
  }

  if (fiber.return === null) {
    throw new Error('A fiber has no return');
  }

  return fiberToRoot(fiber.return);
}

function performSyncWorkOnRoot(root: FiberRoot) {
  renderRoot(root);

  root.finishedWork = root.current.alternate;

  commitRoot(root);
}

function renderRoot(root: FiberRoot) {
  workInProgress = createWorkInProgress(root.current, null);

  if (workInProgress !== null) {
    workLoopSync();
  }
}

function workLoopSync() {
  while (workInProgress !== null) {
    workInProgress = performUnitOfWork(workInProgress);
  }
}

function performUnitOfWork(unitOfWork: Fiber): Fiber | null {
  const current = unitOfWork.alternate;

  let next = beginWork(current, unitOfWork);

  if (next === null) {
    next = completeUnitOfWork(unitOfWork);
  }

  return next;
}

function completeUnitOfWork(unitOfWork: Fiber): Fiber | null {
  workInProgress = unitOfWork;

  while (workInProgress !== null) {
    let returnFiber: Fiber | null = workInProgress.return;
    let siblingFiber = workInProgress.sibling;

    const next = completeWork(workInProgress);

    if (next !== null) {
      return next;
    }

    if (siblingFiber !== null) {
      return siblingFiber;
    } else if (returnFiber !== null) {
      if (returnFiber.firstEffect === null) {
        returnFiber.firstEffect = workInProgress.firstEffect;
      }

      if (workInProgress.lastEffect !== null) {
        if (returnFiber.lastEffect !== null) {
          returnFiber.lastEffect.nextEffect = workInProgress.firstEffect;
        }
        returnFiber.lastEffect = workInProgress.lastEffect;
      }

      if (workInProgress.effectTag > PerformedWork) {
        if (returnFiber.lastEffect !== null) {
          returnFiber.lastEffect.nextEffect = workInProgress;
        } else {
          returnFiber.firstEffect = workInProgress;
        }
        returnFiber.lastEffect = workInProgress;
      }

      workInProgress = returnFiber;
      continue;
    } else {
      return null;
    }
  }

  return null;
}

function commitRoot(root: FiberRoot) {
  console.log('Commit root', root);

  const firstEffect = root.finishedWork!.firstEffect;

  let nextEffect = firstEffect;

  while (nextEffect !== null) {
    commitHostEffect(nextEffect);
    if (nextEffect !== null) {
      nextEffect = nextEffect.nextEffect;
    }
  }
}

function getHostParentFiber(fiber: Fiber) {
  let parent = fiber.return;

  while (parent !== null) {
    if (
      parent.tag === WorkTag.HostComponent ||
      parent.tag === WorkTag.HostRoot
    ) {
      return parent;
    }
    parent = parent.return;
  }
}

function commitHostEffect(effect: Fiber) {
  const parentHostFiber = getHostParentFiber(effect)!;

  let parent: Element;
  let isRootContainer: Boolean;

  switch (parentHostFiber.tag) {
    case WorkTag.HostComponent: {
      parent = parentHostFiber.stateNode;
      isRootContainer = false;
      break;
    }
    case WorkTag.HostRoot: {
      parent = parentHostFiber.stateNode.containerInfo;
      isRootContainer = true;
      break;
    }
    default: {
      console.error(parentHostFiber);
      throw new Error('Unknown host parent');
    }
  }

  console.log('Parent', parent, parentHostFiber);

  let node = effect;

  while (true) {
    if (node.tag === WorkTag.HostComponent || node.tag === WorkTag.HostText) {
      parent.appendChild(node.stateNode);
    } else if (node.child !== null) {
      node.child.return = node;
      node = node.child;
      continue;
    }

    if (node === effect) {
      return;
    }

    while (node.sibling === null) {
      if (node.return === null || node.return === effect) {
        return;
      }
      node = node.return;
    }
    node.sibling.return = node.return;
    node = node.sibling;
  }
}
