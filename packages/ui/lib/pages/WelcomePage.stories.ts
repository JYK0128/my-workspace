import type { Meta, StoryObj } from '@storybook/react-vite';

import { WelcomePage } from '#pages/index.ts';
import { buildArgs } from '#utils.ts';


const meta = {
  title: 'Example/WelcomePage',
  component: WelcomePage,
} satisfies Meta<typeof WelcomePage>;

export default meta;
type Story = StoryObj<typeof meta>;

const initialHandlers: HandlerProps<Story['args']> = {
  onPrev: undefined,
  onNext: undefined,
  onMove: undefined,
  onFinishSurvey: undefined,
  onCancelSurvey: undefined,
  onIncompleteForm: undefined,
  onCompleteForm: undefined,
  onUserRegister: undefined,
  onResendEmail: undefined,
  onGotoLogin: undefined,
};

const initialValues: ValueProps<Story['args']> = {
  test: undefined,
};

export const Index: Story = {
  args: buildArgs<Story['args']>({
    ...initialHandlers,
    ...initialValues,
  }),
};
