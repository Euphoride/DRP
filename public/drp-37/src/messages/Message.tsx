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

export type MessageRecord = {
  from: string;
  to: string;
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
      to: blob.to || "default",
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

const MessageDisplay: Component<{
  message: MessageRecord;
  me: string;
  them: string;
}> = (props) => {
  return (
    <div>
      <div
        classList={{
          [style.bubbleR]: props.me === props.message.from,
          [style.bubbleL]: props.me === props.message.to,
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

const MessagePlatform: Component<{ me: string; them: string }> = (props) => {
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
      from: props.me,
      to: props.them,
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
            <MessageDisplay message={item} me={props.me} them={props.them} />
          ))}
        </div>
      </div>
      <div class={style.input_view}>
        <input class={style.message_box_input} type="text" ref={inputTextRef} />
        <input
          class={style.message_box_send}
          type="submit"
          value="Send"
          onClick={messageSendHandler}
        />
      </div>
    </div>
  );
};

export const otherName = (name: string) => {
  return name === "Carl" ? "Alex" : "Carl";
};

const NotesPage: Component<{ me: string; them: string }> = (props) => {
  return (
    <div>
      <h3 class={style.notes_header}> Notes</h3>
      <input type="text" class={style.notes_input}></input>
    </div>
  );
};

const MessagePage: Component<{ me: string; them: string }> = (props) => {
  var [shownPage, setShownPage] = createSignal(0);
  return (
    <div
      classList={{
        [style.Messages]: true,
      }}
    >
      <div class={style.navbar}>
        <div class={style.message_header}>
          <A href={"/" + props.me}>
            <button class={style.header_button}> Back </button>
          </A>
          <button
            class={style.header_button}
            onclick={() => {
              setShownPage(0);
            }}
          >
            {" "}
            Chat{" "}
          </button>
          <p class={style.chatWith}>{props.them}</p>
          <button
            class={style.header_button}
            onclick={() => {
              setShownPage(1);
            }}
          >
            {" "}
            Notes{" "}
          </button>
          <button
            class={style.header_button}
            onClick={() => {
              setShownPage(2);
            }}
          >
            {" "}
            Reminders{" "}
          </button>
        </div>
      </div>
      {shownPage() == 0 && <MessagePlatform me={props.me} them={props.them} />}
      {shownPage() == 1 && <NotesPage me={props.me} them={props.them} />}
      {shownPage() == 2 && <App name={props.me} />}
    </div>
  );
};

export default MessagePage;
