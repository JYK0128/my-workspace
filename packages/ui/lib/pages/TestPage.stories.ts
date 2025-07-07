import { TestPage } from '#pages/index.ts';
import type { Meta, StoryObj } from '@storybook/react-vite';


const meta = {
  title: 'Test/TestPage',
  component: TestPage,
} satisfies Meta<typeof TestPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Index: Story = {};
