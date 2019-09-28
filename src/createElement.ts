import { VNode } from './types';

export function createElement(
  type: string,
  props: Record<string, any>,
  ...children: any[]
) {
  props = props || {};

  if (children != null && children.length > 0) {
    props.children = children;
  }

  return {
    $$typeof: 'React.Element',
    type,
    key: props.key || null,
    props
  };
}
