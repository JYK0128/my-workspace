import { createContext, useEffect, useState } from 'react';

let count = 0;
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

export const MsgType = {
  ALERT: 'alert',
  CONFIRM: 'confirm',
  ERROR: 'error',
} as const;
export type MsgType = typeof MsgType[keyof typeof MsgType];

type Message = {
  type: MsgType
  title?: string
  description: string
};

type MessageWithId = Message & {
  id: string
  open: boolean
  toggle: (open: boolean) => void
  cancel: () => void
  confirm: () => void
};

export type MessageContext = object;
export const MessageContext = createContext<Nullable<MessageContext>>(null);


type State = {
  messages: MessageWithId[]
};
type Action =
  | {
    type: 'OPEN'
    payload: Omit<MessageWithId, 'open'>
  }
  | {
    type: 'TOGGLE'
    payload: Pick<MessageWithId, 'id' | 'open'>
  }
  | {
    type: 'CANCEL'
    payload: Pick<MessageWithId, 'id'>
  }
  | {
    type: 'CONFIRM'
    payload: Pick<MessageWithId, 'id'>
  };

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'OPEN': {
      return {
        ...state,
        messages: [{ ...action.payload, open: true }, ...state.messages],
      };
    }

    case 'TOGGLE': {
      return {
        ...state,
        messages: state.messages.map((d) =>
          d.id === action.payload.id ? { ...d, open: action.payload.open } : d,
        ),
      };
    }

    case 'CANCEL':
    case 'CONFIRM': {
      return {
        ...state,
        messages: state.messages.map((d) =>
          d.id === action.payload.id ? { ...d, open: false } : d,
        ),
      };
    }
  }
};

const listeners: Array<(state: State) => void> = [];
let memoryState: State = { messages: [] };

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => {
    listener(memoryState);
  });
}

const message = (props: Message) => {
  const id = genId();
  const type = props.type;
  let resolver: (bool: boolean) => void;
  const result = new Promise<boolean>((resolve) => resolver = resolve);


  function toggle(open: boolean) {
    dispatch({
      type: 'TOGGLE',
      payload: { id: id, open },
    });

    if (!open) {
      resolver(false);
    }
  }

  function cancel() {
    dispatch({
      type: 'CANCEL',
      payload: { id: id },
    });

    resolver(false);
  }

  function confirm() {
    dispatch({
      type: 'CONFIRM',
      payload: { id: id },
    });

    resolver(type !== 'error');
  }

  dispatch({
    type: 'OPEN',
    payload: { ...props, id, toggle, cancel, confirm },
  });

  return result;
};

export function useMessage() {
  const [state, setState] = useState(memoryState);

  useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, [state]);

  return {
    ...state,
    message,
  };
}
