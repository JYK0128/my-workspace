import type { Meta, StoryObj } from '@storybook/react-vite';

import { ChatPage } from '#pages/index.ts';


const meta = {
  title: 'Example/ChatPage',
  component: ChatPage,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof ChatPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Index: Story = {
  parameters: {
    docs: {
      description: {
        story: `
          # 채팅 페이지
          
          - 시스템/사용자/상대방 메시지 구분
          - 메시지 상호작용 버튼 지원
          - 메시지 로딩 상태 지원
          - 다양한 입력 가능(파일 등)
        `,
      },
    },
  },
};
