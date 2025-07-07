import { BoardPage } from '#pages/index.ts';
import type { Meta, StoryObj } from '@storybook/react-vite';


const meta = {
  title: 'Complete/BoardPage',
  component: BoardPage,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof BoardPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Index: Story = {
  parameters: {
    docs: {
      description: {
        story: `
          # 게시판 페이지
          Shadcn 기반 커스터마이징이 자유로운 테이블 

          - 필터 / 정렬 지원
          - 행 선택 지원
          - 행 확장 지원
          - 열 크기 조정 지원
          - 행렬 이동 지원
          - 행렬 상하단 고정 지원

          - fix me: 확장 행 선택 시 intermediate checkbox
          - fix me: 확장 행 faceting
        `,
      },
    },
  },
};
