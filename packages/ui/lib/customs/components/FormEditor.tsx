import { ForwardedRef, forwardRef, useEffect } from 'react';
import { FieldPath, FieldValues, RefCallBack, UseControllerProps } from 'react-hook-form';
import lang from 'suneditor/src/lang';
import SunEditorCore from 'suneditor/src/lib/core';
import SunEditor, { buttonList } from 'suneditor-react';

import { useCallbackRef } from '#customs/hooks/index.ts';
import { FormField } from '#shadcn/components/ui/index.ts';

type Props<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = UseControllerProps<TFieldValues, TName>;


/** 텍스트 에디터 */
export const FormEditor = forwardRef(
  function FormEditorInner<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  >(
    props: Props<TFieldValues, TName>,
    ref: ForwardedRef<SunEditorCore>,
  ) {
    const [editorRef, setEditorRef] = useCallbackRef(ref);

    const getSunEditorInstance = (ref: RefCallBack) => (editor: SunEditorCore) => {
      setEditorRef(editor);
      ref(editor);
    };

    useEffect(() => {
      if (editorRef.current) {
        editorRef.current.setOptions({
          buttonList: buttonList.complex,
          lang: lang.ko,
          placeholder: '내용을 입력해주세요.',
          resizeEnable: false,
        });
      }
    }, [editorRef]);

    return (
      <FormField
        {...props}
        render={({ field }) => (
          <SunEditor
            name={field.name}
            disable={field.disabled}
            onBlur={field.onBlur}
            onChange={field.onChange}
            getSunEditorInstance={getSunEditorInstance(field.ref)}
            setContents={field.value}
          />
        )}
      />
    );
  },
);
