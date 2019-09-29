import { Fiber, WorkTag } from '../types';
import { PerformedWork } from '../shared/effectTag';

export function completeWork(wip: Fiber): Fiber | null {
  console.log('Complete Work', wip);
  const current = wip.alternate;

  switch (wip.tag) {
    case WorkTag.HostRoot: {
      if (current === null || current.child === null) {
        wip.effectTag = PerformedWork;
      }
      return null;
    }
    case WorkTag.HostComponent: {
      const instance = createDomNodeInstance(wip.type, wip.pendingProps);

      appendAllChildren(instance, wip);

      wip.stateNode = instance;

      return null;
    }
    case WorkTag.HostText: {
      const instance = document.createTextNode(wip.pendingProps);

      wip.stateNode = instance;

      return null;
    }
  }

  return null;
}

export function createDomNodeInstance(type: string, props: any) {
  const domElement = document.createElement(type, props);
  return domElement;
}

export function appendAllChildren(instance: Element, wip: Fiber) {
  let node = wip.child;

  while (node !== null) {
    if (node.tag === WorkTag.HostComponent || node.tag === WorkTag.HostText) {
      instance.appendChild(node.stateNode);
    } else if (node.child !== null) {
      node.child.return = node;
      node = node.child;
      continue;
    }

    if (node === wip) {
      return;
    }

    while (node.sibling === null) {
      if (node.return === null || node.return === wip) {
        return;
      }
      node = node.return;
    }

    node.sibling.return = node.return;
    node = node.sibling;
  }
}
