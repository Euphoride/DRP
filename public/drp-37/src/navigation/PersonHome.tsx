import { A } from "@solidjs/router";
import { Component } from "solid-js";

import { otherName } from "../messages/Message";
import style from "./Person.module.css";

const ChatChooser: Component<{ name: string }> = (props) => {
  return (
    <div class={style.big_button_box}>
      <A href={"/" + props.name + "/chat"}>
        <button class={style.big_button}> {otherName(props.name)} </button>
      </A>
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
            <button> Back </button>
          </A>
          <p class={style.chatWith}>{props.name}'s homepage</p>
          <A href="/app">
            <button> Reminders </button>
          </A>
        </div>
      </div>

      <ChatChooser name={props.name} />
      <Prompt />
    </div>
  );
};

export default PersonPage;
