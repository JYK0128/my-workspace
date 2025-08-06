import type { Meta, StoryObj } from '@storybook/react-vite';

import { EditorPage } from '#pages/index.ts';


const meta = {
  title: 'Complete/EditorPage',
  component: EditorPage,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof EditorPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Index: Story = {
  parameters: {
    docs: {
      description: {
        story: `
          # 에디터 페이지
          sunEditor의 React Wrapper 

          - Form Element 지원

          - fix me: 반응형 처리
        `,
      },
    },
  },
};
