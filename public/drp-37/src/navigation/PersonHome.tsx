import { A } from "@solidjs/router";
import { Component, createResource } from "solid-js";

import style from "./Person.module.css";

async function getContacts(name: string): Promise<string[]> {
  const response = await fetch(`/api/contacts?name=${name}`, {
    headers: { "Content-Type": "application/json" },
    method: "GET",
  });

  const raw_data = await response.json();

  const list: string[] =
    raw_data.message?.flatMap((item: any) => {
      if (!item) return [];

      return item as string;
    }) || [];

  return new Promise((resolve, _) => {
    resolve(list);
  });
}

const ChatChooser: Component<{ name: string }> = (props) => {
  const [contacts, { mutate, refetch }] = createResource(async () => {
    return await getContacts(props.name);
  });

  return (
    <div class={style.big_button_box}>
      {contacts() &&
        contacts()?.map((item, _) => (
          <div class={style.contact_grid}>
            <A href={"/" + props.name + "/" + item}>
              <button class={style.big_button}> {item} </button>
            </A>
            <A href={"/reflection/" + props.name + "/" + item}>
              <button class={style.big_button}> Reflect about {item} </button>
            </A>
          </div>
        ))}
      {contacts.loading && <p>Loading contacts...</p>}
    </div>
  );
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
            <button class={style.button}> Back </button>
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
