import type { Meta, StoryObj } from '@storybook/react-vite';

import { SlotPage } from '#pages/SlotPage.tsx';


const meta = {
  title: 'Complete/SlotPage',
  component: SlotPage,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof SlotPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Index: Story = {
  parameters: {
    docs: {
      description: {
        story: `
          # 슬롯 페이지
          슬롯 컴포넌트 테스트

          - 화면 구역을 제약하기 위한 컴포넌트
        `,
      },
    },
  },
};
