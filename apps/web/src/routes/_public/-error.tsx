import { ErrorComponentProps, useNavigate, useRouter } from '@tanstack/react-router';

type ActionMap = {
  GO_HOME: never
  GO_BACK: never
  RESET: never
};

export function ErrorPage({ error, reset }: ErrorComponentProps) {
  const navigate = useNavigate();
  const { history } = useRouter();

  const handler = ({ action }: Action<ActionMap>) => {
    switch (action) {
      case 'GO_HOME':
        return () => navigate({ to: '/' });
      case 'GO_BACK':
        return () => history.back();
      case 'RESET':
        return () => reset();
    }
  };

  return (
    <div>
      <div>{error.name}</div>
      <div>{error.message}</div>
      <button onClick={handler({ action: 'GO_BACK' })}>Back</button>
      <button onClick={handler({ action: 'GO_HOME' })}>Go Home</button>
      <button onClick={handler({ action: 'RESET' })}>Reset</button>
    </div>
  );
}
