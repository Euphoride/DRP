import { A } from "@solidjs/router";
import { Component, For, JSXElement } from "solid-js";

import style from "./Person.module.css";

async function getContacts(name: string): Promise<string[]> {
  const response = await fetch("/api/contacts", {
    headers: { "Content-Type": "application/json", name: name },
    method: "GET",
  });
  const raw_data = await response.json();
  const list: string[] =
    raw_data.message?.flatMap((item: any) => {
      if (!item) return [];

      return item as string;
    }) || [];

  return new Promise((resolve, reject) => {
    resolve(list);
  });
}

const ChatChooser: Component<{ name: string }> = (props) => {
  const contacts = getContacts(props.name);
  var p: JSXElement = undefined;
  contacts.then((contacts) => {
    p = (
      <div class={style.big_button_box}>
        <For each={contacts}>
          {(item, _) => (
            <A href={"/" + props.name + "/" + item}>
              =<button class={style.big_button}> {item} </button>
            </A>
          )}
        </For>
      </div>
    );
  });
  return p;
};

const Prompt: Component = () => {
  return (
    <div class={style.prompt_box}>
      <h4> Today's Prompt:</h4>
      <p> What's the most recent book you read?</p>
    </div>
  );
};
const PersonPage: Component<{ name: string }> = (props) => {
  return (
    <div>
      <div class={style.navbar}>
        <div class={style.person_header}>
          <A href="/">
            <button> Back </button>
          </A>
          <p class={style.chatWith}>{props.name}'s homepage</p>
        </div>
      </div>

      <ChatChooser name={props.name} />
      <Prompt />
    </div>
  );
};

export default PersonPage;
