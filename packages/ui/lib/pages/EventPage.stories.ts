import type { Meta, StoryObj } from '@storybook/react-vite';

import { EventPage } from '#pages/EventPage.tsx';
import { TestPage } from '#pages/index.ts';


const meta = {
  title: 'Complete/EventPage',
  component: EventPage,
} satisfies Meta<typeof TestPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Index: Story = {
  parameters: {
    docs: {
      description: {
        story: `
          # 이벤트 테스트 페이지
          이벤트 전역 관리체계 테스트

          - 시작 이벤트만 실행
          - 일정 시간마다 실행
          - 마지막 이벤트 실행
        `,
      },
    },
  },
};
