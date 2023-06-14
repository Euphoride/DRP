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

import { App, ReminderPage } from "../App";

import BackButton from "../assets/arrow.png";
import ChatButton from "../assets/chat.png";
import NotesButton from "../assets/write.png";
import ReminderButton from "../assets/bell.png";
import SendButton from "../assets/dm.png";
import Dismiss from "solid-dismiss";

export type MessageRecord = {
  sender: string;
  recipient: string;
  message: string;
  timestamp: number;
};

async function establishWebsocketConnection(
  mutate: Setter<MessageRecord[] | undefined>
): Promise<WebSocket> {
  const host = location.origin.replace(/^http/, "ws");
  const ws = new WebSocket(host);

  ws.onmessage = async (event) => {
    const blob = JSON.parse(await event.data.text());

    const newBlob = {
      sender: blob.to || "default",
      recipient: blob.recipient || "default content",
      message: blob.message || "default content",
      timestamp: blob.timestamp || 0,
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
          [style.bubbleR]: props.me === props.message.sender,
          [style.bubbleL]: props.me === props.message.recipient,
        }}
      >
        {props.message.message}
      </div>
    </div>
  );
};

export async function getMessages(): Promise<MessageRecord[]> {
  const response = await fetch("/api/messages");
  const raw_data = await response.json();

  const data: MessageRecord[] =
    raw_data.message?.flatMap((item: any) => {
      if (!item.sender || !item.recipient || !item.message || !item.timestamp)
        return [];

      return [
        {
          sender: item.sender as string,
          recipient: item.recipient as string,
          message: item.message as string,
          timestamp: item.timestamp as number,
        },
      ];
    }) || [];

  console.log(data);

  return data;
}

export async function postMessage(
  from: string,
  content: string,
  message: string,
  timestamp: number
) {
  await fetch("/api/messages", {
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sender: from || "Default content",
      recipient: content || "Default content",
      message: message || "Default content",
      timestamp: timestamp || 0,
    }),
    method: "POST",
  });
}

const MessagePlatform: Component<{ me: string; them: string }> = (props) => {
  let inputTextRef: HTMLInputElement | undefined = undefined;
  let messageViewRef: HTMLDivElement | undefined = undefined;

  const [messages, { mutate, refetch }] =
    createResource<MessageRecord[]>(getMessages);

  const [webSocket, _] = createSignal(establishWebsocketConnection(mutate));

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
      sender: props.me,
      recipient: props.them,
      message: inputTextRef!.value,
      timestamp: new Date().getTime(),
    };

    inputTextRef!.value = "";

    socket.send(JSON.stringify(mesBundle));

    mutate((prev) => [...(prev || []), mesBundle]);

    await postMessage(
      mesBundle.sender,
      mesBundle.recipient,
      mesBundle.message,
      mesBundle.timestamp
    );

    refetch();
  };

  return (
    <div>
      <div class={style.seperator_view}>
        <div ref={messageViewRef!} class={style.message_view}>
          {messages()
            ?.filter(
              (messageRecord) =>
                (messageRecord.sender == props.me &&
                  messageRecord.recipient == props.them) ||
                (messageRecord.sender == props.them &&
                  messageRecord.recipient == props.me)
            )
            .map((item) => (
              <MessageDisplay message={item} me={props.me} them={props.them} />
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

export const notesFocusOutHandler = (
  sender: string,
  recipient: string,
  note: string
) => {
  fetch("/api/notes", {
    headers: { "content-type": "application/json" },
    method: "POST",
    body: JSON.stringify({
      sender,
      recipient,
      note,
      timestamp: new Date().getTime(),
    }),
  });
};

export const getNote = (me: string, them: string) => {
  return async () => {
    return await fetch(`/api/notes?sender=${me}&recipient=${them}`);
  };
};

const NotesInput: Component<{ me: string; them: string; preview: boolean }> = (
  props
) => {
  let textAreaRef: HTMLTextAreaElement | undefined = undefined;

  const [note, _] = createResource(getNote(props.me, props.them));

  createEffect(
    on(note, async () => {
      if (!note.loading) {
        const text = await note()?.json();

        console.log(note);
        if (textAreaRef) textAreaRef.value = text.message.note;
      }
    })
  );

  return (
    <div>
      <h3 class={style.notes_header}> Notes</h3>
      <textarea
        ref={textAreaRef!}
        class={style.notes_input}
        style={props.preview ? "height:20vh;" : ""}
        onFocusOut={() =>
          notesFocusOutHandler(
            props.me,
            props.them,
            textAreaRef!.value || "Default note"
          )
        }
      ></textarea>
    </div>
  );
};

const NotesPage: Component<{ me: string; them: string }> = (props) => {
  return (
    <div class={style.notes_page}>
      <NotesInput me={props.me} them={props.them} preview={false} />
    </div>
  );
};

const MessagePage: Component<{ me: string; them: string }> = (props) => {
  var [shownPage, setShownPage] = createSignal(0);
  const [reminderOpen, reminderSetOpen] = createSignal(false);
  let reminderPopupRef;
  const [notesOpen, notesSetOpen] = createSignal(false);
  let notesPopupRef;
  return (
    <div
      classList={{
        [style.Messages]: true,
      }}
    >
      <div class={style.navbar}>
        <div class={style.message_header}>
          <A href={"/" + props.me}>
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
          <p class={style.chatWith}>{props.them}</p>
          <input
            class={style.header_button}
            type="image"
            src={NotesButton}
            ref={notesPopupRef}
          />
          <input
            class={style.header_button}
            type="image"
            src={ReminderButton}
            ref={reminderPopupRef}
          />
        </div>
        <div style="position: relative;">
          <Dismiss
            menuButton={reminderPopupRef}
            open={reminderOpen}
            setOpen={reminderSetOpen}
          >
            <div class={style.popup}>
              <App name={props.them} callback={() => reminderSetOpen(false)} />
              <button
                onClick={() => {
                  reminderSetOpen(false);
                  setShownPage(2);
                }}
              >
                Show full Reminders Page
              </button>
            </div>
          </Dismiss>
        </div>
        <div style="position: relative;">
          <Dismiss
            menuButton={notesPopupRef}
            open={notesOpen}
            setOpen={notesSetOpen}
          >
            <div class={style.popup}>
              <NotesInput me={props.me} them={props.them} preview />
              <button
                class={style.button}
                onClick={() => {
                  notesSetOpen(false);
                  setShownPage(1);
                }}
              >
                Show full Notes Page
              </button>
            </div>
          </Dismiss>
        </div>
      </div>
      {shownPage() == 0 && <MessagePlatform me={props.me} them={props.them} />}
      {shownPage() == 1 && <NotesPage me={props.me} them={props.them} />}
      {shownPage() == 2 && (
        <ReminderPage name={props.them} callback={() => {}} />
      )}
    </div>
  );
};

export default MessagePage;
