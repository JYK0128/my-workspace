import { createContext } from 'react';

export const MESSAGE = {
  ALERT: 'alert',
  CONFIRM: 'confirm',
  ERROR: 'error',
} as const;
export type MESSAGE = typeof MESSAGE[keyof typeof MESSAGE];


export type MessageContext = object;
export const MessageContext = createContext<Nullable<MessageContext>>(null);
export const MessageProvider = MessageContext.Provider;
