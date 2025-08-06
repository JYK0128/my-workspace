import type { Meta, StoryObj } from '@storybook/react-vite';

import { FlowPage } from '#pages/FlowPage.tsx';


const meta = {
  title: 'Complete/FlowPage',
  component: FlowPage,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof FlowPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Index: Story = {
  parameters: {
    docs: {
      description: {
        story: `
          # Flow Page
        `,
      },
    },
  },
};
