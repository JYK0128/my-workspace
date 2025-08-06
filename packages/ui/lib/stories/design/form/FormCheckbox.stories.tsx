import { zodResolver } from '@hookform/resolvers/zod';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { type SubmitErrorHandler, type SubmitHandler, useForm, useFormContext } from 'react-hook-form';
import { action } from 'storybook/actions';
import { z } from 'zod';

import { FormCheckbox } from '#customs/components/FormCheckbox.tsx';
import { FormController } from '#customs/components/FormController.tsx';
import { Button } from '#shadcn/components/ui/button.tsx';

// 1. Meta
/**
 * FormController 전용 Checkbox 컴포넌트입니다.
 * 기본적인 input[type=checkbox] 속성과 함께 다음 속성을 지원합니다.
 */
const meta = {
  title: 'Design/Form/Checkbox',
  component: FormCheckbox,
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
    falsely: {
      description: '체크박스가 선택되지 않았을 때의 값',
      control: { type: 'radio' },
      options: ['false', 'null', 'undefined'],
      mapping: {
        false: { type: false },
        null: { type: null },
        undefined: { type: undefined },
      },
      table: {
        defaultValue: { summary: '{ type: false }' },
      },
    },
  },
  decorators: [(Story, { args }) => {
    const schema = z.object({
      input: z.boolean(),
    }).default({
      input: args.falsely?.type as never,
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
        `<FormCheckbox
          control={form.control}
          name={name}
          required={required}
          label={label}
          labelWidth={labelWidth}
          showError={showError}
          orientation={orientation}
          falsely={falsely}
        />`,
      },
    },
  },
} satisfies Meta<typeof FormCheckbox>;

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
    falsely: { type: undefined },
  },
  render: (args) => {
    const { name, required, label, labelWidth, showError, orientation, falsely } = args;
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const form = useFormContext();

    return (
      <FormCheckbox
        control={form.control}
        name={name}
        required={required}
        label={label}
        labelWidth={labelWidth}
        showError={showError}
        orientation={orientation}
        falsely={falsely}
      />
    );
  },
};
