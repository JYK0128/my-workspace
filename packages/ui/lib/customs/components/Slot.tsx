import React, { HTMLAttributes, PropsWithChildren, ReactElement } from 'react';

export interface SlotProps extends PropsWithChildren<HTMLAttributes<HTMLElement>> {
  asChild?: boolean
}

export function Slot({ children, asChild, ...props }: SlotProps) {
  if (asChild) {
    const childrenArray = React.Children.toArray(children);
    const childCount = childrenArray.length;
    if (childCount === 1) {
      const child = childrenArray[0] as ReactElement<HTMLAttributes<HTMLElement>>;
      return React.cloneElement(child, {
        ...props,
        className: [props.className, child.props.className].filter((v) => !!v).join(' '),
        style: { ...props.style, ...child.props.style },
      });
    }
    else {
      throw Error('expected to receive a single React element child.');
    }
  }
  else {
    <div {...props}>
      {children}
    </div>;
  }
}
