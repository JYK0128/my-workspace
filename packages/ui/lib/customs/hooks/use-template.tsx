import { Children, ComponentProps, Fragment, isValidElement, ReactNode } from 'react';

type Props<T extends string> = {
  name: T
  children: ReactNode
} & (
  | { asChild: true }
  | { asChild?: false } & ComponentProps<'div'>
);

/**
 * 템플릿 생성 함수
 * @param slots 슬롯 이름
 * @returns
 */
export function useTemplate<T extends string>(slots: readonly T[]) {
  function Slot({ name, children, asChild, ...props }: Props<T>) {
    const Component = asChild ? Fragment : 'div';
    return (
      <Component {...props}>
        {children}
      </Component>
    );
  }

  function Template({ children, ...props }: ComponentProps<'div'>) {
    const elements = {} as Record<T, ReactNode>;

    Children.forEach(children, (child) => {
      if (
        isValidElement<Props<T>>(child)
        && child.type === Slot
        && slots.includes(child.props.name as T)
      ) {
        elements[child.props.name as T] = child.props.children;
      }
    });

    return (
      <div {...props}>
        {Object.entries<ReactNode>(elements).map(([key, value]) => (
          <Fragment key={key}>
            {value}
          </Fragment>
        ))}
      </div>
    );
  }

  return { Slot, Template };
}
