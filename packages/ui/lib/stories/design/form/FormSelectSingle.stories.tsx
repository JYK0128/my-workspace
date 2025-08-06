import { zodResolver } from '@hookform/resolvers/zod';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { type SubmitErrorHandler, type SubmitHandler, useForm, useFormContext } from 'react-hook-form';
import { action } from 'storybook/actions';
import { z } from 'zod';

import { FormController } from '#customs/components/FormController.tsx';
import { FormSelectSingle } from '#customs/components/FormSelectSingle.tsx';
import { Button } from '#shadcn/components/ui/button.tsx';

// 1. Meta
/**
 * FormController 전용 Select(단수) 컴포넌트입니다.
 * 기본적인 select 속성과 함께 다음 속성을 지원합니다.
 */
const meta = {
  title: 'Design/Form/SelectSingle',
  component: FormSelectSingle,
  argTypes: {
    control: {
      description: 'react-hook-form의 control 객체',
      control: { disable: true },
    },
    name: {
      description: '입력 필드의 이름',
      control: { disable: true },
    },
    required: {
      description: 'required 속성',
      control: { type: 'boolean' },
    },
    label: {
      description: '필드의 라벨',
      control: { type: 'text' },
    },
    labelWidth: {
      description: '라벨의 너비',
      control: { type: 'text' },
    },
    showError: {
      description: '폼 에러 메시지를 표시할지 여부',
      control: { type: 'boolean' },
    },
    orientation: {
      description: '필드와 라벨의 배치 방향',
      control: { type: 'radio' },
      options: ['horizontal', 'vertical'],
    },
    items: {
      description: 'Select 아이템 목록',
      control: { type: 'object' },
    },
  },
  decorators: [(Story) => {
    const schema = z.object({
      input: z.enum(['item01', 'item02', 'item03']).nullable(),
    }).default({
      input: null,
    });

    const form = useForm({
      resolver: zodResolver(schema.removeDefault()),
      defaultValues: schema._def.defaultValue(),
    });

    const onSubmit: SubmitHandler<z.infer<typeof schema>>
    = (...args) => action('submit')(args);
    const onError: SubmitErrorHandler<z.infer<typeof schema>>
    = (...args) => action('error')(args);

    return (
      <FormController
        form={form}
        onSubmit={onSubmit}
        onError={onError}
      >
        <Story />
        <Button type="reset">초기화</Button>
        <Button type="submit">제출</Button>
      </FormController>
    );
  }],
  parameters: {
    docs: {
      source: {
        code:
        `<FormSelectSingle
          control={form.control}
          name={name}
          required={required}
          label={label}
          labelWidth={labelWidth}
          showError={showError}
          orientation={orientation}
          items={items}
        />`,
      },
    },
  },
} satisfies Meta<typeof FormSelectSingle>;

// 2. Settings
export default meta;
type Story = StoryObj<typeof meta>;

// 3. Story
export const Default: Story = {
  args: {
    control: {} as never,
    name: 'input',
    required: true,
    label: '라벨',
    labelWidth: '180px',
    showError: true,
    orientation: 'horizontal',
    placeholder: '입력해주세요.',
    items: [
      { label: '선택안함', value: null },
      { label: '1번 아이템', value: 'item01' },
      { label: '2번 아이템', value: 'item02', disabled: true },
      { label: '3번 아이템', value: 'item03' },
    ],
  },
  render: (args) => {
    const { name, required, label, labelWidth, showError, orientation, items } = args;
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const form = useFormContext();

    return (
      <FormSelectSingle
        control={form.control}
        name={name}
        required={required}
        label={label}
        labelWidth={labelWidth}
        showError={showError}
        orientation={orientation}
        items={items}
      />
    );
  },
};
