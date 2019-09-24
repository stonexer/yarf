import { VNode } from '../types';
import {
  createContainer,
  updateContainer
} from '../reconciler/fiberReconciler';

export function render(vnode: VNode, parentDOMNode: HTMLElement) {
  const container = createContainer(parentDOMNode);

  updateContainer(vnode, container);
}
