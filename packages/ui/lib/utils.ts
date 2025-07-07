import { action } from 'storybook/actions';

/** 파일 스트림 생성 */
export const fileStream = (file: File) => {
  const create = (
    callback?: (file: File, pct: number) => void,
  ) => {
    const totalSize = file.size;
    let uploadedBytes = 0;

    const transformStream = new TransformStream<Uint8Array, Uint8Array>({
      start() {
        callback?.(file, Math.min((uploadedBytes / totalSize) * 100, 100));
      },
      transform(chunk, controller) {
        uploadedBytes += chunk.length;

        // Call callback with progress percentage
        callback?.(file, Math.min((uploadedBytes / totalSize) * 100, 100));

        controller.enqueue(chunk);
      },
      flush(controller) {
        controller.terminate();
      },
    });

    return file.stream().pipeThrough(transformStream);
  };

  return { create };
};

/** 스토리북 handler 문서화 */
export const buildArgs = <T extends Record<string, unknown>>(
  defaultValues: Partial<Omit<T, 'children'>> = {},
) => {
  return new Proxy(defaultValues, {
    get: (target, prop) => {
      if (target[prop.toString()]) {
        return target[prop.toString()];
      }
      else if (/^on[A-Z]/.test(prop.toString())) {
        return action(prop.toString()); // 이벤트 핸들러를 자동으로 `action()`으로 변환
      }
      else {
        return undefined;
      }
    },
  }) as T;
};
