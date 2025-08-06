import type { Meta, StoryObj } from '@storybook/react-vite';

import { TreePage } from '#pages/index.ts';


const meta = {
  title: 'Complete/TreePage',
  component: TreePage,
} satisfies Meta<typeof TreePage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Index: Story = {
};
