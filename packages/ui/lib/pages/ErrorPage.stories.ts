import type { Meta, StoryObj } from '@storybook/react-vite';

import { ErrorPage } from '#pages/index.ts';


const meta = {
  title: 'Complete/ErrorPage',
  component: ErrorPage,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof ErrorPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Index: Story = {
  parameters: {
    docs: {
      description: {
        story: `
          # 에러 테스트 페이지
          에러 전역 관리체계 테스트

          - 렌더링 에러 - React 컴포넌트 오류
          - 런타임(동기) 에러 - 동기 JavaScript 오류(예: null 참조)
          - 런타임(비동기) 에러 - 비동기 JavaScript 오류(예: 통신 실패)
        `,
      },
    },
  },
};
