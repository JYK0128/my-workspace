import { ModalPage } from '#pages/ModalPage.tsx';
import type { Meta, StoryObj } from '@storybook/react-vite';


const meta = {
  title: 'Complete/ModalPage',
  component: ModalPage,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof ModalPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Index: Story = {
  parameters: {
    docs: {
      description: {
        story: `
          # 모달 페이지
          다이얼로그와 팝업 폼 테스트

          - 다이얼로그 error, confirm, alert 예시
          - 팝업 폼(이전 페이지 캐싱, 팝업 이탈 방지, 팝업 종료 후처리) 예시
        `,
      },
    },
  },
};
