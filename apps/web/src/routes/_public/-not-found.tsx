import { useNavigate, useRouter } from '@tanstack/react-router';

type ActionMap = {
  GO_HOME: never
  GO_BACK: never
};

export function NotFoundPage() {
  const navigate = useNavigate();
  const { history } = useRouter();

  const handler = ({ action }: Action<ActionMap>) => {
    switch (action) {
      case 'GO_HOME':
        return () => navigate({ to: '/' });
      case 'GO_BACK':
        return () => history.back();
    }
  };

  return (
    <div>
      <div>not found</div>
      <button onClick={handler({ action: 'GO_BACK' })}>Back</button>
      <button onClick={handler({ action: 'GO_HOME' })}>Go Home</button>
    </div>
  );
}
