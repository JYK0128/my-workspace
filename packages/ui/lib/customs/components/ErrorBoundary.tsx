import { isNil } from 'lodash-es';
import { cloneElement, Component, isValidElement, PropsWithChildren, ReactElement, ReactNode, useEffect } from 'react';

interface Props {
  logger?: (error?: Error) => void
  fallback?: ReactNode & { reset?: () => void }
  children?: ReactNode
}

interface FallbackProps {
  reset: () => void
}

/** 에러 탐지 + 로깅 도구 */
export function ErrorBoundary({ children, fallback, logger }: PropsWithChildren<Props>) {
  return (
    <RenderErrorBoundary fallback={fallback} logger={logger}>
      <RuntimeErrorBoundary logger={logger}>
        {children}
      </RuntimeErrorBoundary>
    </RenderErrorBoundary>
  );
}

interface State {
  hasError: boolean
}

/** 렌더링 에러 탐지 */
class RenderErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  reset = () => {
    this.setState({ hasError: false });
  };


  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch() {
  }

  public render() {
    if (this.state.hasError) {
      return isValidElement(this.props.fallback)
        ? cloneElement(this.props.fallback as ReactElement<FallbackProps>, { reset: this.reset })
        : this.props.fallback;
    }
    else {
      return this.props.children;
    }
  }
}

/** 런타임 에러 탐지 */
function RuntimeErrorBoundary({ children, logger }: PropsWithChildren<Pick<Props, 'logger'>>) {
  useEffect(() => {
    window.onerror = (_message, _source, _lineno, _colno, error) => {
      if (import.meta.env.MODE === 'production') {
        return true;
      }
      if (isNil(error)) return;
      if (!error?.stack?.includes('renderWithHooks')) {
        logger?.(error);
      }
    };
    window.onunhandledrejection = (event) => {
      if (import.meta.env.MODE === 'production') {
        event.preventDefault();
      }
      logger?.(new Error(event.reason.message));
    };

    return () => {
      window.onerror = null;
    };
  }, [logger]);

  return children;
}
