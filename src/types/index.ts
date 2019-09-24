/**
 * Key
 */
export type Key = null | string;

/**
 * 虚拟 DOM 节点
 */
export interface VNode<P = {}> {
  $$typeof: any;

  type: any;
  props: P;
  key: Key;
}

/**
 * Work tag
 *
 * fiber 节点的任务类型
 */
export enum WorkTag {
  HostRoot,
  HostComponent
}

/**
 * Fiber 节点
 *
 * A Fiber is work on a Component that needs to be done or was done. There can
 * be more than one per component.
 */
export interface Fiber {
  // Fiber 的类型
  tag: WorkTag;

  // Unique identifier of this child.
  key: Key;

  // type of element like button, div
  elementType: string | null;

  // The resolved function/class/ associated with this fiber.
  type: any;

  // The local state associated with this fiber.
  stateNode: any;

  return: Fiber | null;

  child: Fiber | null;
  sibling: Fiber | null;
  index: number;

  // 被合并版本的 Fiber
  alternate: Fiber | null;

  pendingProps: any;
  memoizedProps: any;

  // TODO: 更新队列
  updateQueue: Array<any> | null;
}

export interface FiberRoot {
  current: Fiber;

  containerInfo: any;
}

export interface ReactElement {
  $$typeof: any;
  type: any;
  props: any;
  key: Key;
}
