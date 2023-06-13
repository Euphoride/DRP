import {
  Component,
  Setter,
  createEffect,
  createResource,
  createSignal,
  on,
} from "solid-js";

import style from "./refection.module.css";

const PlainPage: Component<{ message: string }> = (props) => {
  return <div class={style.reflection_message}>{props.message}</div>;
};

const ReflectionPage: Component = () => {
  // const ReflectionPage: Component<{ name: string, about: string }> = (props) => {
  var [shownPage, setShownPage] = createSignal(0);
  return (
    <div>
      <div class={style.container}>
        {shownPage() == 0 && <PlainPage message="Greeting" />}
        {shownPage() == 1 && <PlainPage message="Importance" />}
        {shownPage() == 2 && <PlainPage message="Last Time" />}
        {shownPage() == 3 && <PlainPage message="Change" />}
        {shownPage() == 4 && <PlainPage message="Hinderances" />}
        {shownPage() == 5 && <PlainPage message="frequency" />}
      </div>
      <div class={style.footbar}>
        <button
          class={style.button}
          onclick={() => {
            setShownPage(shownPage() === 0 ? 0 : shownPage() - 1);
          }}
        >
          Back
        </button>
        <button
          class={style.button}
          onclick={() => {
            setShownPage(shownPage() == 5 ? 5 : shownPage() + 1);
          }}
        >
          continue
        </button>
      </div>
    </div>
  );
};

export default ReflectionPage;
