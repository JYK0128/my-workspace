import { LoginPage } from '#pages/index.ts';
import type { Meta, StoryObj } from '@storybook/react-vite';


const meta = {
  title: 'Example/LoginPage',
  component: LoginPage,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof LoginPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Index: Story = {
  parameters: {
    docs: {
      description: {
        story: `
          # 로그인 페이지
          폼 / 모달 테스트

          - 아이디/패스워드: Validation 테스트
          - 패스워드 찾기: 팝업 폼 테스트
          - 로그인: 메시지 팝업 테스트 
        `,
      },
    },
  },
};
