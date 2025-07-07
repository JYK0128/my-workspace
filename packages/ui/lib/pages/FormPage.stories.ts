import { FormPage } from '#pages/index.ts';
import type { Meta, StoryObj } from '@storybook/react-vite';


const meta = {
  title: 'Complete/FormPage',
  component: FormPage,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof FormPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Index: Story = {
  parameters: {
    docs: {
      description: {
        story: `
          # 폼 컴포넌트 페이지
          react-hook-form 폼 컴포넌트 최적화

          - 라벨 + 입력 구조
          - Enum 기반 Intellisense 지원
          - 반응형 레이아웃 지원
        `,
      },
    },
  },
};
