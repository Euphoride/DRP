// message mock
import {
  Component,
  Setter,
  createEffect,
  createResource,
  createSignal,
  on,
} from "solid-js";
import { A } from "@solidjs/router";

import style from "./message.module.css";

import App from "../App";

import BackButton from "../assets/arrow.png";
import ChatButton from "../assets/chat.png";
import NotesButton from "../assets/write.png";
import ReminderButton from "../assets/bell.png";
import SendButton from "../assets/dm.png";

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
      from: from || "Default content",
      content: content || "Default content",
    }),
    method: "POST",
  });
}

const MessagePlatform: Component<{ name: string }> = (props) => {
  let inputTextRef: HTMLInputElement | undefined = undefined;
  let messageViewRef: HTMLDivElement | undefined = undefined;

  const [messages, { mutate, refetch }] =
    createResource<MessageRecord[]>(getMessages);

  const [webSocket, _] = createSignal(
    establishWebsocketConnection(mutate, refetch)
  );

  createEffect(
    on(messages, () => {
      messageViewRef?.scrollTo(0, messageViewRef?.scrollHeight);
    })
  );

  const messageSendHandler = async () => {
    if (!inputTextRef!.value) {
      alert("Message can't be empty!");
      return;
    }

    const socket = await webSocket();

    const mesBundle = {
      from: props.name,
      content: inputTextRef!.value,
    };

    inputTextRef!.value = "";

    socket.send(JSON.stringify(mesBundle));

    mutate((prev) => [...(prev || []), mesBundle]);

    await postMessage(mesBundle.from, mesBundle.content);

    refetch();
  };

  return (
    <div>
      <div class={style.seperator_view}>
        <div ref={messageViewRef!} class={style.message_view}>
          {messages.loading && <p style="color:red;">Loading messages</p>}
          {messages()?.map((item) => (
            <MessageDisplay message={item} name={props.name} />
          ))}
        </div>
      </div>
      <div class={style.input_view}>
        <input class={style.message_box_input} type="text" ref={inputTextRef} />
        <input
          class={style.message_box_send}
          type="image"
          src={SendButton}
          onClick={messageSendHandler}
        />
      </div>
    </div>
  );
};

export const otherName = (name: string) => {
  return name === "Carl" ? "Alex" : "Carl";
};

const NotesPage: Component = () => {
  return (
    <div>
      <h3 class={style.notes_header}> Notes</h3>
      <input type="text" class={style.notes_input}></input>
    </div>
  );
};

const MessagePage: Component<{ name: string }> = (props) => {
  var [shownPage, setShownPage] = createSignal(0);
  return (
    <div
      classList={{
        [style.Messages]: true,
      }}
    >
      <div class={style.navbar}>
        <div class={style.message_header}>
          <A href={"/" + props.name}>
            <input class={style.header_button} type="image" src={BackButton} />
          </A>
          <input
            class={style.header_button}
            type="image"
            src={ChatButton}
            onclick={() => {
              setShownPage(0);
            }}
          />
          <p class={style.chatWith}>{otherName(props.name)}</p>
          <input
            class={style.header_button}
            type="image"
            src={NotesButton}
            onclick={() => {
              setShownPage(1);
            }}
          />
          <input
            class={style.header_button}
            type="image"
            src={ReminderButton}
            onClick={() => {
              setShownPage(2);
            }}
          />
        </div>
      </div>
      {shownPage() == 0 && <MessagePlatform name={props.name} />}
      {shownPage() == 1 && <NotesPage />}
      {shownPage() == 2 && <App name={props.name} />}
    </div>
  );
};

export default MessagePage;
