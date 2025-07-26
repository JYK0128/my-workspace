import { FormController } from '#customs/components/FormController.tsx';
import { FormMonthPicker } from '#customs/components/FormMonthPicker.tsx';
import { Button } from '#shadcn/components/ui/button.tsx';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useForm, useFormContext, type SubmitErrorHandler, type SubmitHandler } from 'react-hook-form';
import { action } from 'storybook/actions';
import { z } from 'zod';

// 1. Meta
/**
 * FormController 전용 MonthPicker(단수) 컴포넌트입니다.
 * react-day-picker 속성 일부와 다음 속성을 지원합니다.
 */
const meta = {
  title: 'Design/Form/MonthPicker',
  component: FormMonthPicker,
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
    fromDate: {
      description: '시작 범위',
      control: { type: 'date' },
    },
    toDate: {
      description: '종료 범위',
      control: { type: 'date' },
    },
    dateFormat: {
      description: '날짜 포맷',
      control: { type: 'text' },
    },
  },
  decorators: [(Story) => {
    const schema = z.object({
      input: z.date(),
    }).default({
      input: null as never,
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
        `<FormMonthPicker
          control={form.control}
          name={name}
          required={required}
          label={label}
          labelWidth={labelWidth}
          showError={showError}
          orientation={orientation}
          fromDate={fromDate}
          toDate={toDate}
          dateFormat={dateFormat}
        />`,
      },
    },
  },
} satisfies Meta<typeof FormMonthPicker>;

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
    fromDate: new Date().sub('year', 1),
    toDate: new Date().add('year', 1),
    dateFormat: 'yyyy-MM-dd',
  },
  render: (args) => {
    const { name, required, label, labelWidth, showError, orientation, fromDate, toDate, dateFormat } = args;
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const form = useFormContext();

    return (
      <FormMonthPicker
        control={form.control}
        name={name}
        required={required}
        label={label}
        labelWidth={labelWidth}
        showError={showError}
        orientation={orientation}
        fromDate={fromDate}
        toDate={toDate}
        dateFormat={dateFormat}
      />
    );
  },
};
