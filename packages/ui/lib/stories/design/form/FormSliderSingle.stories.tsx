import { FormController } from '#customs/components/FormController.tsx';
import { FormInput } from '#customs/components/FormInput.tsx';
import { FormSliderSingle } from '#customs/components/FormSliderSingle.tsx';
import { Button } from '#shadcn/components/ui/button.tsx';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useForm, useFormContext, type SubmitErrorHandler, type SubmitHandler } from 'react-hook-form';
import { action } from 'storybook/actions';
import { z } from 'zod';

// 1. Meta
/**
 * FormController 전용 Slider 컴포넌트입니다.
 * 기본적인 input[type=slider] 속성과 함께 다음 속성을 지원합니다.
 */
const meta = {
  title: 'Design/Form/SliderSingle',
  component: FormInput,
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
    slider: {
      description: '슬라이더의 방향',
      control: { type: 'radio' },
      options: ['horizontal', 'vertical'],
    },
    input: {
      description: '슬라이더의 입력도구 방향',
      control: { type: 'radio' },
      options: ['top', 'bottom', 'left', 'right', 'none'],
    },
    dir: {
      description: '슬라이더의 증가 방향',
      control: { type: 'radio' },
      options: ['ltr', 'rtl'],
    },
    min: {
      description: '슬라이더의 최소값',
      control: { type: 'number' },
    },
    max: {
      description: '슬라이더의 최대값',
      control: { type: 'number' },
    },
    step: {
      description: '슬라이더의 이동단위',
      control: { type: 'number' },
    },
  },
  parameters: {
    docs: {
      source: {
        code:
        `<FormSliderSingle
          control={form.control}
          name={name}
          required={required}
          label={label}
          labelWidth={labelWidth}
          showError={showError}
          orientation={orientation}
          input={input}
          slider={slider}
          dir={dir}
          min={min}
          max={max}
          step={step}
        />`,
      },
    },
  },
  decorators: [(Story) => {
    const schema = z.object({
      input: z.number(),
    }).default({
      input: 0,
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
} satisfies Meta<typeof FormSliderSingle>;

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
    input: 'top',
    slider: 'horizontal',
    dir: 'ltr',
    min: 0,
    max: 100,
    step: 1,
  },
  render: (args) => {
    const { name, required, label, labelWidth, showError, orientation, input, slider, dir, min, max, step } = args;
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const form = useFormContext();

    return (
      <FormSliderSingle
        control={form.control}
        name={name}
        required={required}
        label={label}
        labelWidth={labelWidth}
        showError={showError}
        orientation={orientation}
        input={input}
        slider={slider}
        dir={dir}
        min={min}
        max={max}
        step={step}
      />
    );
  },
};
