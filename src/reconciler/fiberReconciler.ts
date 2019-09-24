import { FiberRoot, VNode } from '../types';
import { createFiberRoot } from './fiber';
import { scheduleWork } from './scheduler';

export function createContainer(container: Element): FiberRoot {
  return createFiberRoot(container);
}

export function updateContainer(element: VNode, fiberRoot: FiberRoot) {
  const current = fiberRoot.current;

  const update = {
    payload: {
      element
    }
  };

  current.updateQueue = [update];

  scheduleWork(current);
}
