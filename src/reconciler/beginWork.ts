import { Fiber, WorkTag } from '../types';
import { reconcileChildren } from './childFiber';
import { PerformedWork } from '../shared/effectTag';

export function beginWork(current: Fiber | null, wip: Fiber): Fiber | null {
  console.log('Begin work', wip);
  switch (wip.tag) {
    case WorkTag.HostRoot: {
      return updateHostRoot(current, wip);
    }
    case WorkTag.FunctionComponent: {
      return updateFunctionComponent(current, wip);
    }
    case WorkTag.HostText: {
      return null;
    }
    default: {
      return updateHostComponent(current, wip);
    }
  }
}

function updateHostRoot(current: Fiber | null, wip: Fiber) {
  const nextProps = wip.pendingProps;
  const prevState = wip.memoizedProps;

  // TODO:
  if (
    wip.updateQueue &&
    wip.updateQueue[0] &&
    wip.updateQueue[0].payload &&
    wip.updateQueue[0].payload.element
  ) {
    wip.memoizedProps = wip.updateQueue[0];
  } else {
    throw new Error('`element` is not defined');
  }

  const nextState = wip.memoizedProps;
  const nextChildren = nextState.payload.element;

  reconcileChildren(current, wip, nextChildren);

  return wip.child;
}

function updateFunctionComponent(current: Fiber | null, wip: Fiber) {
  const Component = wip.type;

  const nextChildren = Component(wip.pendingProps);

  wip.effectTag = PerformedWork;

  reconcileChildren(current, wip, nextChildren);

  return wip.child;
}

function updateHostComponent(current: Fiber | null, wip: Fiber) {
  const nextProps = wip.pendingProps;
  const prevProps = current !== null ? current.memoizedProps : null;

  let nextChildren = nextProps.children;

  reconcileChildren(current, wip, nextChildren);

  return wip.child;
}
