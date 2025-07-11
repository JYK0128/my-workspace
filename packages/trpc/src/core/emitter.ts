import { EventEmitter, on } from 'events';
export { on };


/* 이벤트 정의 */
export type EmitterMap = {
  message: [{ channelId: string, userId: string, nickname: string, content: string }]
  question: [{ channelId: string, userId: string, nickname: string, content: string }]
};
export const emitter = new EventEmitter<EmitterMap>();

/* 이벤트 관리 */
export class Queue<T> {
  private queue: T[] = [];
  private resolvers: ((value: T) => void)[] = [];

  enqueue(item: T) {
    const resolver = this.resolvers.shift();
    if (resolver) {
      resolver(item);
    }
    else {
      this.queue.push(item);
    }
  }

  async dequeue(): Promise<T> {
    const item = this.queue.shift();
    if (item !== undefined) {
      return item;
    }

    return new Promise<T>((resolve) => {
      this.resolvers.push(resolve);
    });
  }
}
