import { FormCheckbox, FormCheckGroup, FormController, FormDateMultiPicker, FormDatePicker, FormDateRange, FormDatetimePicker, FormInput, FormMonthMultiPicker, FormMonthPicker, FormMonthRange, FormRadioGroup, FormRicharea, FormSelectMulti, FormSelectSingle, FormTextarea, FormYearMultiPicker, FormYearPicker, FormYearRange, SidebarLayout } from '#customs/components/index.ts';
import { Button } from '#shadcn/components/ui/index.ts';
import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitErrorHandler, SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';

const ITEM = {
  '01': '01',
  '02': '02',
  '03': '03',
} as const;

const fields = z.object({
  input: z.string().min(1),
  date: z.date(),
  datetime: z.date(),
  dateArray: z.date().array().min(1),
  dateRange: z.tuple([
    z.date(),
    z.date(),
  ]),
  checked: z.boolean(),
  picked: z.nativeEnum(ITEM),
  checkList: z.nativeEnum(ITEM).array(),
  selected: z.nativeEnum(ITEM).nullable(),
  filtered: z.nativeEnum(ITEM).array(),
}).default({
  // @ts-expect-error - default value
  input: '',
  date: null,
  datetime: null,
  dateArray: [],
  dateRange: [],
  checked: null,
  picked: null,
  checkList: [],
  selected: null,
  filtered: [],
});
type FieldValues = z.infer<typeof fields>;


export function FormPage() {
  const form = useForm({
    resolver: zodResolver(fields.removeDefault()),
    defaultValues: fields._def.defaultValue(),
  });

  const handleSubmit: SubmitHandler<FieldValues> = (_payload, evt) => {
    const { submitter } = (evt?.nativeEvent ?? {}) as SubmitEvent;
    if (!(submitter instanceof HTMLButtonElement)) return;
    switch (submitter.name) {
      case 'submit':
        return;
      default:
        throw new Error('unexpected error');
    }
  };

  const handleError: SubmitErrorHandler<FieldValues> = (errors, evt) => {
    const { submitter } = (evt?.nativeEvent ?? {}) as SubmitEvent;
    if (!(submitter instanceof HTMLButtonElement)) return;

    console.log(errors);
  };

  return (
    <SidebarLayout>
      <FormController
        form={form}
        onSubmit={handleSubmit}
        onError={handleError}
        className="tw:flex tw:flex-col tw:gap-2"
      >
        <FormInput
          control={form.control}
          orientation="horizontal"
          showError
          name="input"
          label="입력 - text"
          labelWidth="150px"
        />
        <FormTextarea
          control={form.control}
          orientation="horizontal"
          showError
          name="input"
          label="입력 - textarea"
          labelWidth="150px"
        />
        <FormRicharea
          control={form.control}
          orientation="horizontal"
          showError
          name="input"
          label="입력 - richarea"
          labelWidth="150px"
        />
        <FormCheckbox
          control={form.control}
          orientation="horizontal"
          showError
          name="checked"
          label="토글 - 체크박스"
          required
          labelWidth="150px"
        />
        <FormRadioGroup
          control={form.control}
          name="picked"
          label="선택 - 라디오"
          labelWidth="150px"
          showError
          orientation="horizontal"
          items={[
            { label: '1번 아이템', value: ITEM['01'] },
            { label: '2번 아이템', value: ITEM['02'] },
            { label: '3번 아이템', value: ITEM['03'] },
          ]}
        />
        <FormCheckGroup
          control={form.control}
          name="checkList"
          label="선택 - 체크박스"
          labelWidth="150px"
          showError
          orientation="horizontal"
          items={[
            { label: '1번 아이템', value: ITEM['01'] },
            { label: '2번 아이템', value: ITEM['02'] },
            { label: '3번 아이템', value: ITEM['03'] },
          ]}
        />
        <FormSelectSingle
          control={form.control}
          orientation="horizontal"
          showError
          name="selected"
          label="선택 - 리스트"
          labelWidth="150px"
          items={[
            { label: '선택안함', value: null },
            { label: '1번 아이템', value: ITEM['01'] },
            { label: '2번 아이템', value: ITEM['02'] },
            { label: '3번 아이템', value: ITEM['03'] },
          ]}
        />

        <FormSelectMulti
          control={form.control}
          orientation="horizontal"
          showError
          name="filtered"
          label="선택 - 커멘더"
          labelWidth="150px"
          items={[
            { label: '1번 아이템', value: ITEM['01'] },
            { label: '2번 아이템', value: ITEM['02'] },
            { label: '3번 아이템', value: ITEM['03'] },
          ]}
        />

        <FormDatePicker
          control={form.control}
          orientation="horizontal"
          showError
          name="date"
          label="날짜 - 단일"
          labelWidth="150px"
        />
        <FormDateMultiPicker
          control={form.control}
          orientation="horizontal"
          showError
          min={3}
          max={5}
          name="dateArray"
          label="날짜 - 복수"
          labelWidth="150px"
        />
        <FormDateRange
          control={form.control}
          orientation="horizontal"
          showError
          name="dateRange"
          label="날짜 - 범위"
          labelWidth="150px"
        />
        <FormDatetimePicker
          control={form.control}
          orientation="horizontal"
          showError
          name="datetime"
          label="날짜/시간 - 단일"
          labelWidth="150px"
        />
        <FormMonthPicker
          control={form.control}
          orientation="horizontal"
          showError
          name="date"
          fromDate={new Date(2023, 3)}
          toDate={new Date(2025, 10)}
          label="연/월 - 단일"
          labelWidth="150px"
        />
        <FormMonthMultiPicker
          control={form.control}
          orientation="horizontal"
          showError
          min={3}
          max={5}
          fromDate={new Date(2023, 3)}
          toDate={new Date(2025, 10)}
          name="dateArray"
          label="연/월 - 복수"
          labelWidth="150px"
        />
        <FormMonthRange
          control={form.control}
          orientation="horizontal"
          showError
          fromDate={new Date(2023, 3)}
          toDate={new Date(2025, 10)}
          name="dateRange"
          label="연/월 - 범위"
          labelWidth="150px"
        />
        <FormYearPicker
          control={form.control}
          orientation="horizontal"
          showError
          fromDate={new Date(2015, 0)}
          toDate={new Date(2035, 0)}
          name="date"
          label="연도 - 단일"
          labelWidth="150px"
        />
        <FormYearMultiPicker
          control={form.control}
          orientation="horizontal"
          showError
          min={3}
          max={5}
          fromDate={new Date(2015, 0)}
          toDate={new Date(2035, 0)}
          name="dateArray"
          label="연도 - 복수"
          labelWidth="150px"
        />
        <FormYearRange
          control={form.control}
          orientation="horizontal"
          showError
          fromDate={new Date(2015, 0)}
          toDate={new Date(2035, 0)}
          name="dateRange"
          label="연도 - 범위"
          labelWidth="150px"
        />

        <Button type="submit" name="submit">안녕</Button>
      </FormController>
    </SidebarLayout>
  );
}
