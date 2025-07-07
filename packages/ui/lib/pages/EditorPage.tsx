import { FormController, FormEditor, SidebarLayout } from '#customs/components/index.ts';
import { Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '#shadcn/components/ui/index.ts';
import { zodResolver } from '@hookform/resolvers/zod';
import { useId } from 'react';
import { SubmitErrorHandler, SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';

const fields = z.object({
  text: z.string(),
}).default({
  text: '',
});
type FieldValues = z.infer<typeof fields>;

export function EditorPage() {
  const formId = useId();
  const form = useForm({
    resolver: zodResolver(fields.removeDefault()),
    defaultValues: fields._def.defaultValue(),
  });

  const handleSubmit: SubmitHandler<FieldValues> = (payload, evt) => {
    const { submitter } = (evt?.nativeEvent ?? {}) as SubmitEvent;
    if (!(submitter instanceof HTMLButtonElement)) return;

    switch (submitter.name) {
      default:
        console.log(payload);
    }
  };

  const handleError: SubmitErrorHandler<FieldValues> = (errors, evt) => {
    const { submitter } = (evt?.nativeEvent ?? {}) as SubmitEvent;
    if (!(submitter instanceof HTMLButtonElement)) return;

    console.error(errors);
  };

  return (
    <SidebarLayout>
      <Card className="tw:size-full tw:grid tw:grid-rows-[auto_1fr_auto]">
        <CardHeader>
          <CardTitle>hi</CardTitle>
          <CardDescription />
        </CardHeader>
        <CardContent className="tw:scroll">
          <FormController
            form={form}
            id={formId}
            onSubmit={handleSubmit}
            onError={handleError}
          >
            <FormEditor name="text" />
            <Button type="submit" name="submit">Submit</Button>
          </FormController>
        </CardContent>
        <CardFooter />
      </Card>
    </SidebarLayout>
  );
}
