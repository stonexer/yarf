import { VNode, Fiber, WorkTag } from '../types';

export function render(vnode: VNode, parentDOMNode: HTMLElement) {
  const rootFiber = {
    tag: WorkTag.HostRoot,
    stateNode: {
      root: parentDOMNode
    },
    props: {
      children: vnode
    }
  };
}

function createRootContainer() {}
