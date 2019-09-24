import { Fiber, WorkTag, FiberRoot } from '../types';
import { createWorkInProgress } from './fiber';
import { beginWork } from './beginWork';

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
  // 完成当前任务，并移动到
  while (true) {
    const current = unitOfWork.alternate;
    const returnFiber = unitOfWork.return;

    const sibling = unitOfWork.sibling;
  }
}
