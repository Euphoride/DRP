// message mock
import { Component, createResource, createSignal } from "solid-js";
import { A } from "@solidjs/router";

import style from "./message.module.css";

type Message = {
  from: string;
  content: string;
};

const MessageRecord: Component<{ message: Message }> = (props) => {
  return (
    <div>
      <p>
        {props.message.from}: {props.message.content}
      </p>
    </div>
  );
};
export type MessageRecord = {
  from: string;
  content: string;
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

const MessagePlatform: Component = () => {
  let inputTextRef: HTMLInputElement | undefined = undefined;

  const [messages, { mutate, refetch }] =
    createResource<Message[]>(getMessages);

  const messageSendHandler = async () => {
    const mesBundle = {
      from: "Alex",
      content: inputTextRef!.value,
    };

    mutate((prev) => [...(prev || []), mesBundle]);

    await postMessage(mesBundle.from, mesBundle.content);

    refetch();
  };

  return (
    <div>
      <div>
        {messages()?.map((item) => (
          <MessageRecord message={item} />
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

const MessagePage: Component = () => {
  return (
    <div class={style.Messages}>
      <A href="/app"> Reminders </A>
      <br />
      <MessagePlatform />
    </div>
  );
};

export default MessagePage;
