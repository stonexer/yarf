import { VNode } from './types';

export function createElement(
  type: string,
  props: Record<string, any>,
  ...children: any[]
) {
  if (children != null && children.length > 0) {
    props.children = children;
  }

  return {
    type,
    key: props.key || null,
    props
  };
}
