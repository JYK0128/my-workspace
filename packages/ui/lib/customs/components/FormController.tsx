import { Form } from '#shadcn/components/ui/index.ts';
import { ComponentProps, ForwardedRef, forwardRef } from 'react';
import { FieldValues, SubmitErrorHandler, SubmitHandler, UseFormReturn } from 'react-hook-form';

type Props<TFieldValues extends FieldValues = FieldValues> =
  & Omit<ComponentProps<'form'>, 'onSubmit' | 'onError'>
  & {
    form: UseFormReturn<TFieldValues>
    onSubmit: SubmitHandler<TFieldValues>
    onError?: SubmitErrorHandler<TFieldValues>
  };


/** 폼 컨트롤러 */
export const FormController = forwardRef(
  function FormControllerInner<TFieldValues extends FieldValues>(
    props: Props<TFieldValues>,
    ref: ForwardedRef<HTMLFormElement>,
  ) {
    const { onSubmit, onError, form, children, ...rest } = props;

    return (
      <Form {...form}>
        <form {...rest} ref={ref} onSubmit={form.handleSubmit(onSubmit, onError)}>
          {children}
        </form>
      </Form>
    );
  },
);
