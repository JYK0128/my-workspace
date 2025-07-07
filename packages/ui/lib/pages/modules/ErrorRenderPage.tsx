import { MuteLayout } from '#customs/components/index.ts';
import { Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '#shadcn/components/ui/index.ts';

type PageProps = {
  reset?: () => void
};

export function ErrorRenderPage({ reset }: PageProps) {
  const handleBackPage = () => {
    history.back();
  };

  const handleResetError = () => {
    reset?.();
  };

  return (
    <MuteLayout>
      <Card className="tw:h-2/3 tw:w-2/3">
        <CardHeader>
          <CardTitle>오류 페이지</CardTitle>
          <CardDescription />
        </CardHeader>
        <CardContent>
          치명적인 오류가 발생했습니다.
        </CardContent>
        <CardFooter className="tw:flex tw:justify-end tw:gap-1">
          <Button onClick={handleBackPage}>뒤로가기</Button>
          <Button onClick={handleResetError}>새로고침</Button>
        </CardFooter>
      </Card>
    </MuteLayout>
  );
}
