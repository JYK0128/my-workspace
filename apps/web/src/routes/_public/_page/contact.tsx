import { zodResolver } from '@hookform/resolvers/zod';
import { useInfiniteQuery, useMutation, useTRPC } from '@packages/trpc';
import { Button, cn, FormController, FormInput, FormRicharea, useMessage } from '@packages/ui';
import { createFileRoute } from '@tanstack/react-router';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useEffect, useMemo, useRef } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';

export const Route = createFileRoute('/_public/_page/contact')({
  component: RouteComponent,
  staticData: {
    title: 'CONTACT',
    order: 5,
  },
});

const emailFields = z.object({
  email: z.string().email(),
  title: z.string().min(1),
  content: z.string().min(1),
  files: z.instanceof(File).array(),
}).default({
  email: '',
  title: '',
  content: '',
  files: [],
});
type EmailFieldValues = z.infer<typeof emailFields>;

const commentFields = z.object({
  nickname: z.string().min(1),
  comment: z.string().min(1),
}).default({
  nickname: `${crypto.randomUUID().split('-').at(0)}`,
  comment: '',
});
type CommentFieldValues = z.infer<typeof commentFields>;

function RouteComponent() {
  const trpc = useTRPC();
  const { message } = useMessage();

  // 이메일
  const emailForm = useForm({
    resolver: zodResolver(emailFields.removeDefault()),
    defaultValues: emailFields._def.defaultValue(),
  });
  const { mutateAsync: sendMail } = useMutation(trpc.sendMail.mutationOptions());

  // 게스트북
  const commentForm = useForm({
    resolver: zodResolver(commentFields.removeDefault()),
    defaultValues: commentFields._def.defaultValue(),
  });
  const { mutateAsync: postComment } = useMutation(trpc.postComment.mutationOptions());
  const { data, fetchNextPage, refetch, hasNextPage, isFetchingNextPage } = useInfiniteQuery(
    trpc.getComments.infiniteQueryOptions({
      cursor: { index: -1, size: 10 },
      orders: [{ field: 'id', sort: 'desc' }],
    },
    {
      getNextPageParam: (lastPage) => {
        const lastItem = lastPage.content.at(-1);
        if (!lastItem) return;

        return {
          index: +lastItem.id,
          size: 10,
        };
      },
      getPreviousPageParam: (lastPage) => {
        const firstItem = lastPage.content.at(0);
        if (!firstItem) return;

        return {
          index: +firstItem.id,
          size: 10,
        };
      },
    }),
  );
  const allRows = useMemo(() => {
    return data ? data.pages.flatMap((d) => d.content) : [];
  }, [data]);

  // 버츄얼라이저
  const scrollRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: hasNextPage ? allRows.length + 1 : allRows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 20,
    overscan: 5,
  });
  const virtualItems = virtualizer.getVirtualItems();

  useEffect(() => {
    const lastItem = virtualItems.at(-1);
    if (!lastItem) return;

    if (lastItem.index >= allRows.length - 1
      && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [allRows.length, fetchNextPage, hasNextPage, isFetchingNextPage, virtualItems]);

  // submitter
  const formHandlers: {
    email: SubmitHandler<EmailFieldValues>
    comment: SubmitHandler<CommentFieldValues>
  } = {
    email: (value, evt) => {
      const formData = new FormData(evt?.target);

      sendMail(formData)
        .then(
          () => message({
            type: 'alert',
            description: '문의가 정상적으로 접수되었습니다.',
          }),
        )
        .catch(
          () => message({
            type: 'error',
            description: '오류가 발생했습니다. 다시 시도바랍니다.',
          }),
        );
    },
    comment: async (value, evt) => {
      const { submitter } = (evt?.nativeEvent ?? {}) as SubmitEvent;
      if (!(submitter instanceof HTMLButtonElement)) return;

      switch (submitter.name) {
        case 'post': {
          await postComment(value);
          await refetch();
          return;
        }
      }
    },
  };

  return (
    <div className={cn(
      'tw:size-full tw:p-5 tw:gap-10',
      'tw:flex tw:flex-row tw:flex-wrap',
      'tw:scroll-y tw:snap-y tw:snap-mandatory',
    )}
    >
      <div className={cn(
        'tw:snap-start',
        'tw:grid tw:grid-rows-[auto_1fr] tw:gap-5',
        'tw:flex-1/2 tw:basis-sm tw:h-full',
      )}
      >
        <h2 className="tw:font-extrabold">이메일 문의</h2>
        <FormController
          form={emailForm}
          onSubmit={formHandlers['email']}
          className="tw:grid tw:grid-rows-[auto_auto_1fr_auto] tw:gap-5"
        >
          <FormInput
            control={emailForm.control}
            label="연락처"
            labelWidth={100}
            orientation="vertical"
            name="email"
          />
          <FormInput
            control={emailForm.control}
            label="제목"
            labelWidth={100}
            orientation="vertical"
            name="title"
          />
          <FormRicharea
            control={emailForm.control}
            label="내용"
            labelWidth={100}
            orientation="vertical"
            name="content"
          />
          <Button type="submit">보내기</Button>
        </FormController>
      </div>

      <div className={cn(
        'tw:snap-start',
        'tw:grid tw:grid-rows-[auto_1fr_auto] tw:gap-5',
        'tw:flex-1/2 tw:h-full',
      )}
      >
        <h2 className="tw:font-extrabold">방명록</h2>
        <FormController
          form={commentForm}
          onSubmit={formHandlers['comment']}
          className="tw:grid tw:grid-rows-[1fr_auto] tw:gap-5"
        >
          <div ref={scrollRef} className="tw:scroll-y">
            <div style={{
              height: `${virtualizer.getTotalSize()}px`,
              position: 'relative',
            }}
            >
              {virtualItems.map((row) => {
                const isLoaderRow = row.index > allRows.length - 1;
                const post = allRows[row.index];

                return (
                  <div
                    key={row.index}
                    ref={virtualizer.measureElement}
                    data-index={row.index}
                    className="tw:absolute tw:w-full"
                    style={{
                      transform: `translateY(${row.start}px)`,
                    }}
                  >
                    {isLoaderRow
                      ? hasNextPage
                        ? 'loading more...'
                        : 'Nothing more to load'
                      : (
                        <div className="tw:flex tw:flex-col tw:border-b-2">
                          <div className="tw:font-extrabold">{post.nickname}</div>
                          <div>{post.comment}</div>
                          <div className="tw:text-right">{post.updated_at.toLocaleString('ko-KR')}</div>
                        </div>
                      )}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="tw:grid tw:grid-cols-[auto_1fr_auto] tw:items-end tw:gap-2">
            <FormInput
              className="tw:w-30"
              control={commentForm.control}
              name="nickname"
              label="닉네임"
              orientation="vertical"
            />
            <FormInput
              control={commentForm.control}
              name="comment"
              label="내용"
              orientation="vertical"
            />
            <Button type="submit" name="post">제출</Button>
          </div>
        </FormController>
      </div>
    </div>
  );
}
