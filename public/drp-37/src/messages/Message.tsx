// message mock
import { Component, Setter, createResource, createSignal } from "solid-js";
import { A } from "@solidjs/router";

import style from "./message.module.css";

export type MessageRecord = {
  from: string;
  content: string;
};

async function establishWebsocketConnection(
  mutate: Setter<MessageRecord[] | undefined>,
  refetch: (
    info?: unknown
  ) => MessageRecord[] | Promise<MessageRecord[] | undefined> | null | undefined
): Promise<WebSocket> {
  const host = location.origin.replace(/^http/, "ws");
  const ws = new WebSocket(host);

  ws.onmessage = async (event) => {
    const blob = JSON.parse(await event.data.text());

    const newBlob = {
      from: blob.from || "default",
      content: blob.content || "default content",
    };

    mutate((prev) => [...(prev || []), newBlob]);
  };

  return new Promise((resolve, _) => {
    const timer = setInterval(() => {
      if (ws.readyState === 1) {
        clearInterval(timer);
        resolve(ws);
      }
    }, 10);
  });
}

const MessageDisplay: Component<{ message: MessageRecord; name: string }> = (
  props
) => {
  return (
    <div>
      <div
        classList={{
          [style.bubbleR]: props.name === props.message.from,
          [style.bubbleL]: props.name !== props.message.from,
        }}
      >
        {props.message.content}
      </div>
    </div>
  );
};

export async function getMessages(): Promise<MessageRecord[]> {
  const response = await fetch("/api/messages");
  const raw_data = await response.json();

  const data: MessageRecord[] =
    raw_data.message?.flatMap((item: any) => {
      if (!item.from || !item.content) return [];

      return [
        {
          from: item.from as string,
          content: item.content as string,
        },
      ];
    }) || [];

  return data;
}

export async function postMessage(from: string, content: string) {
  await fetch("/api/messages", {
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      content,
    }),
    method: "POST",
  });
}

const MessagePlatform: Component<{ name: string }> = (props) => {
  let inputTextRef: HTMLInputElement | undefined = undefined;

  const [messages, { mutate, refetch }] =
    createResource<MessageRecord[]>(getMessages);

  const [webSocket, _] = createSignal(
    establishWebsocketConnection(mutate, refetch)
  );

  const messageSendHandler = async () => {
    const socket = await webSocket();

    const mesBundle = {
      from: props.name,
      content: inputTextRef!.value,
    };

    socket.send(JSON.stringify(mesBundle));

    mutate((prev) => [...(prev || []), mesBundle]);

    await postMessage(mesBundle.from, mesBundle.content);

    refetch();
    window.scrollTo(0, document.body.scrollHeight);
  };

  return (
    <div>
      <div>
        {messages()?.map((item) => (
          <MessageDisplay message={item} name={props.name} />
        ))}
      </div>
      <div>
        <input type="text" ref={inputTextRef} />
        <input
          type="submit"
          value="Send Message!"
          onClick={messageSendHandler}
        />
      </div>
    </div>
  );
};

const MessagePage: Component<{ name: string }> = (props) => {
  return (
    <div class={style.Messages}>
      <A href="/app"> Reminders </A>
      <A href="/alex"> Alex </A>
      <A href="/carl"> Carl </A>
      <br />
      <MessagePlatform name={props.name} />
    </div>
  );
};

export default MessagePage;
