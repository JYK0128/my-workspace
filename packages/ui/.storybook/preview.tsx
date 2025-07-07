import { ErrorBoundary, Message, Toaster } from '#index.ts';
import { ErrorRenderPage } from '#pages/index.ts';
import { withThemeByClassName } from '@storybook/addon-themes';
import type { Decorator, Preview, ReactRenderer } from '@storybook/react-vite';
import { Fragment } from 'react/jsx-runtime';
import { toast } from 'sonner';
import './preview.css';

const decorators: Decorator[] = [
  withThemeByClassName<ReactRenderer>({
    themes: {
      light: 'light',
      dark: 'dark',
    },
    defaultTheme: 'light',
  }),
  (Story) => {
    return (
      <Fragment>
        <ErrorBoundary
          fallback={<ErrorRenderPage />}
          logger={(error) => toast(error?.name, { description: error?.message, duration: 1000 })}
        >
          <Story />
        </ErrorBoundary>
        <Message />
        <Toaster />
      </Fragment>
    );
  },
];

const preview: Preview = {
  decorators,
  parameters: {
    layout: 'fullscreen',
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  tags: ['autodocs'],
};

export default preview;
