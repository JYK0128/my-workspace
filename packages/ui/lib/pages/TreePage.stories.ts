import { TreePage } from '#pages/index.ts';
import type { Meta, StoryObj } from '@storybook/react-vite';


const meta = {
  title: 'Complete/TreePage',
  component: TreePage,
} satisfies Meta<typeof TreePage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Index: Story = {
};
