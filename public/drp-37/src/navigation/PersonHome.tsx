import { A } from "@solidjs/router";
import { Component, createResource } from "solid-js";

import style from "./Person.module.css";

async function getContacts(
  name: string
): Promise<{ name: string; time: number }[]> {
  const response = await fetch(`/api/contacts?name=${name}`, {
    headers: { "Content-Type": "application/json" },
    method: "GET",
  });

  const raw_data = await response.json();

  const list: { name: string; time: number }[] =
    raw_data.message?.flatMap((item: any) => {
      if (!item.name || item.number) return [];

      return [
        {
          name: item.name as string,
          time: item.time as number,
        },
      ];
    }) || [];

  return new Promise((resolve, _) => {
    resolve(list);
  });
}

const displayTimeSince = (time: number) => {
  if (time == 0) return "never";
  const day = 86400000;
  const daysSince = Math.floor((Date.now() - time) / day);
  if (daysSince < 7) return daysSince + " days";
  else return Math.floor(daysSince / 7) + " weeks";
};

const ChatChooser: Component<{ name: string }> = (props) => {
  const [contacts, { mutate, refetch }] = createResource(async () => {
    return await getContacts(props.name);
  });

  return (
    <div class={style.big_button_box}>
      {contacts() &&
        contacts()?.map((item, _) => (
          <div class={style.contact_grid}>
            <A
              style="text-decoration: none; padding: 2vh; padding-left: 17vw;"
              href={"/" + props.name + "/" + item.name}
            >
              <button class={style.contact_button}> {item.name} </button>
              <p class={style.p}>{displayTimeSince(item.time)}</p>
            </A>
            <A href={"/reflection/" + props.name + "/" + item.name}>
              <button class={style.accent_button}> Reflect </button>
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
