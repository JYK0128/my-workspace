import React, { type ComponentPropsWithRef, type ElementType, HTMLAttributes, ReactElement } from 'react';

export type SlotProps<T extends ElementType = 'div'> = {
  asChild?: boolean
  as?: T
} & ComponentPropsWithRef<T>;

export function Slot({ children, as, asChild, ...props }: SlotProps) {
  if (asChild) {
    const childrenArray = React.Children.toArray(children);
    const childCount = childrenArray.length;
    if (childCount !== 1) {
      throw Error('expected to receive a single React element child.');
    }
    else {
      const child = childrenArray[0] as ReactElement<HTMLAttributes<HTMLElement>>;
      return React.cloneElement(child, {
        ...props,
        className: [props.className, child.props.className].filter((v) => !!v).join(' '),
        style: { ...props.style, ...child.props.style },
      });
    }
  }
  else {
    const Component = as || 'div';

    return (
      <Component {...props}>
        {children}
      </Component>
    );
  }
}
