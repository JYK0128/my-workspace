import React, { type ComponentPropsWithRef, type ElementType, HTMLAttributes, type PropsWithChildren, ReactElement } from 'react';

export type SlotProps<T extends ElementType = 'div'> =
  PropsWithChildren<{
    asChild: true
  }>
  | ComponentPropsWithRef<T> & {
    asChild?: false
    as?: T
  };

export function Slot(props: SlotProps) {
  if (props.asChild) {
    const { asChild, children, ...newProps } = props;
    const childrenArray = React.Children.toArray(children);
    const childCount = childrenArray.length;
    if (childCount !== 1) {
      throw Error('expected to receive a single React element child.');
    }
    else {
      const child = childrenArray[0] as ReactElement<HTMLAttributes<HTMLElement>>;
      return React.cloneElement(child, {
        ...newProps,
      });
    }
  }
  else {
    const { asChild, as, children, ...newProps } = props;
    const Component = as || 'div';

    return (
      <Component {...newProps}>
        {children}
      </Component>
    );
  }
}
