import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useId } from 'react';
import { SubmitErrorHandler, SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';

import { FormController, FormInput, FormRadioGroup, TreeNode } from '#customs/components/index.ts';
import { useEventUtils, useMessage, useStepModal } from '#customs/hooks/index.ts';
import { Button, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '#shadcn/components/ui/index.ts';

const fields = z.object({
  label: z.string().min(1),
  readonly: z.boolean(),
}).default({
  label: '',
  readonly: false,
});
type FieldValues = z.infer<typeof fields>;

type TreeItemEditorProps = {
  type: 'register'
} | {
  type: 'updater'
  node: TreeNode
};
export type TreeItemEditorCallback = Pick<TreeItemEditorProps, 'type'> & FieldValues;


/** 트리 아이템 에디터 */
export function TreeItemEditor(props: TreeItemEditorProps) {
  const { type } = props;
  const { message } = useMessage();
  const { cancel, confirm } = useStepModal();
  const { stop } = useEventUtils();


  const formId = useId();
  const form = useForm({
    resolver: zodResolver(fields.removeDefault()),
    defaultValues: fields._def.defaultValue(),
  });
  useEffect(() => {
    if (type === 'updater') {
      form.reset({
        ...props.node,
        readonly: props.node.readonly ?? true,
      });
    }
  }, [form, props, type]);

  const handleSubmit: SubmitHandler<FieldValues> = (fields, evt) => {
    const { submitter } = (evt?.nativeEvent ?? {}) as SubmitEvent;
    if (!(submitter instanceof HTMLButtonElement)) return;

    switch (submitter.name) {
      case 'submit':
        confirm({ type, ...fields })
          .then(() => form.reset());
        return;
      default:
        throw new Error('unexpected error');
    }
  };

  const handleError: SubmitErrorHandler<FieldValues> = (errors, evt) => {
    const { submitter } = (evt?.nativeEvent ?? {}) as SubmitEvent;
    if (!(submitter instanceof HTMLButtonElement)) return;

    message({
      type: 'error',
      description: Object.values(errors)[0].message ?? '',
    });
  };

  return (
    <DialogContent onClick={stop}>
      <DialogHeader>
        <DialogTitle>
          {{
            register: '등록',
            updater: '수정',
          }[type]}
        </DialogTitle>
        <DialogDescription />
      </DialogHeader>

      <FormController
        form={form}
        id={formId}
        onSubmit={handleSubmit}
        onError={handleError}
        className="tw:flex tw:flex-col tw:gap-2"
      >
        <FormInput
          control={form.control}
          name="label"
          label="명칭"
          required
          showError
        />
        <FormRadioGroup
          control={form.control}
          name="readonly"
          label="변경 가능"
          items={[
            { label: '허용하지 않음', value: true },
            { label: '허용', value: false },
          ]}
        />
      </FormController>

      <DialogFooter>
        <Button onClick={cancel}>취소</Button>
        <Button type="submit" name="submit" form={formId}>저장</Button>
      </DialogFooter>
    </DialogContent>
  );
}
