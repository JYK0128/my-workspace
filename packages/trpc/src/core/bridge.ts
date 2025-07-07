import { EventEmitter } from 'events';


/* 이벤트 정의 */
type EventMap = {
  message: [{ content: string }]
};
export const emitter = new EventEmitter<EventMap>();

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
