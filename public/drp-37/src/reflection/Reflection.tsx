import {
  Component,
  Setter,
  createEffect,
  createResource,
  createSignal,
  on,
} from "solid-js";
const PlainPage: Component<{ message: string }> = (props) => {
  return <p>{props.message}</p>;
};

const ReflectionPage: Component = () => {
  // const ReflectionPage: Component<{ name: string, about: string }> = (props) => {
  var [shownPage, setShownPage] = createSignal(0);
  return (
    <div>
      <div>
        {shownPage() == 0 && <PlainPage message="Greeting" />}
        {shownPage() == 1 && <PlainPage message="Importance" />}
        {shownPage() == 2 && <PlainPage message="Last Time" />}
        {shownPage() == 3 && <PlainPage message="Change" />}
        {shownPage() == 4 && <PlainPage message="Hinderances" />}
        {shownPage() == 5 && <PlainPage message="frequency" />}
      </div>
      <button
        onclick={() => {
          setShownPage(shownPage() === 0 ? 0 : shownPage() - 1);
        }}
      >
        Back
      </button>
      <button
        onclick={() => {
          setShownPage(shownPage() == 5 ? 5 : shownPage() + 1);
        }}
      >
        continue
      </button>
    </div>
  );
};

export default ReflectionPage;
