import { FormController } from '#customs/components/FormController.tsx';
import { FormInput } from '#customs/components/FormInput.tsx';
import { Button } from '#shadcn/components/ui/button.tsx';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useForm, type SubmitErrorHandler, type SubmitHandler } from 'react-hook-form';
import { action } from 'storybook/actions';
import { z } from 'zod';

// 1. Meta
/**
 * react-hook-form으로 form을 관리합니다.
 * FormController 전용 컴포넌트를 이용합니다.
 */
const meta = {
  title: 'Design/Form/Controller',
  component: FormController,
  argTypes: {
    children: {
      description: 'Form Controller 전용 입력 컴포넌트',
      control: { disable: true },
    },
    form: {
      description: 'react-hook-form의 form 객체',
      control: { disable: true },
    },
    onSubmit: {
      description: 'Submit 핸들러',
    },
    onError: {
      description: 'Error 핸들러',
    },
  },
} satisfies Meta<typeof FormController>;

// 2. Settings
export default meta;
type Story = StoryObj<typeof meta>;

// 3. Story
export const Input: Story = {
  args: {} as never,
  render: () => {
    const schema = z.object({
      input: z.string().min(1, '최소 1자 이상 입력해주세요.'),
    }).default({
      input: '',
    });

    // eslint-disable-next-line react-hooks/rules-of-hooks
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
        <FormInput
          control={form.control}
          name="input"
          label="라벨"
          labelWidth="180px"
          showError={true}
          orientation="vertical"
        />
        <Button type="reset">초기화</Button>
        <Button type="submit">제출</Button>
      </FormController>
    );
  },
};
