import { ListPage } from '#pages/ListPage.tsx';
import type { Meta, StoryObj } from '@storybook/react-vite';


const meta = {
  title: 'Complete/ListPage',
  component: ListPage,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof ListPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Index: Story = {
  parameters: {
    docs: {
      description: {
        story: `
          # 리스트 페이지
          react-virtual 리스트 예시

          - 무한 스크롤 렌더링 최적화
          - 미표출 영역 Padding 처리
        `,
      },
    },
  },
};
