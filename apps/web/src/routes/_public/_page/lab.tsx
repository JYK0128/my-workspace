import { Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@packages/ui';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { useAuth } from 'react-oidc-context';

export const Route = createFileRoute('/_public/_page/lab')({
  component: RouteComponent,
  staticData: {
    title: 'LAB',
    order: 4,
  },
  beforeLoad({ context: { auth } }) {
    if (auth.isAuthenticated) {
      throw redirect ({
        to: '/channel',
      });
    }
  },
});

function RouteComponent() {
  const { signinRedirect } = useAuth();

  return (
    <div className="tw:size-full tw:flex tw:items-center tw:justify-center">
      <Card className="tw:w-1/2 tw:h-1/3">
        <CardHeader>
          <CardTitle>
            로그인이 필요한 페이지입니다.
          </CardTitle>
          <CardDescription />
        </CardHeader>
        <CardContent className="tw:whitespace-pre-line">
          {`접근이 제한된 페이지입니다.
            서비스를 이용하시려면 먼저 로그인해 주세요.`}
        </CardContent>
        <CardFooter className="tw:flex tw:justify-end">
          <Button onClick={() => signinRedirect()}>로그인</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
