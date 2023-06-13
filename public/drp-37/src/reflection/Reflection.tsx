import { Component, createSignal } from "solid-js";

import style from "./refection.module.css";

const restartAnimation = (
  divElement: HTMLDivElement | HTMLButtonElement | undefined
) => {
  if (divElement) {
    divElement.style.animation = "none";
    divElement.offsetHeight;
    divElement.style.animation = "";
  }
};

const PlainPage: Component<{ message: string }> = (props) => {
  return (
    <div>
      <div class={style.reflection_message}>{props.message}</div>
    </div>
  );
};

const ReflectionPage: Component<{ name: string; about: string }> = (props) => {
  const [shownPage, setShownPage] = createSignal(0);

  let leftRef: HTMLDivElement | undefined = undefined;
  let centerRef: HTMLDivElement | undefined = undefined;
  let rightRef: HTMLDivElement | undefined = undefined;
  let continueRef: HTMLButtonElement | undefined = undefined;
  return (
    <div>
      <div class={style.barcontainer}>
        <div class={style.square}>
          <div class={style.left} ref={leftRef!}></div>
          <div class={style.center} ref={centerRef!}></div>
          <div class={style.right} ref={rightRef!}></div>
        </div>
      </div>
      <div class={style.container}>
        {shownPage() == 0 && (
          <PlainPage
            message={
              "Hello " +
              props.name +
              ", let's reflect on you relationship with " +
              props.about +
              "."
            }
          />
        )}
        {shownPage() == 1 && (
          <PlainPage
            message={
              "Who is " +
              props.about +
              " to you? What do you appreciate about them? What special memories do you share?"
            }
          />
        )}
        {shownPage() == 2 && (
          <PlainPage message="When was the last time you met? When did you last chat?" />
        )}
        {shownPage() == 3 && (
          <PlainPage message="Who were you then? What has changed in your life since then?" />
        )}
        {shownPage() == 4 && (
          <PlainPage message="What has gotten in the way of reaching out and connecting? How do you want to combat that?" />
        )}
        {shownPage() == 5 && (
          <PlainPage
            message={
              "After how long would you like to be reminded to reach out to " +
              props.about +
              "?"
            }
          />
        )}
      </div>
      <div class={style.text_area_container}>
        <textarea
          // ref={textRef!}
          style={{ height: "20vh", width: "80vw" }}
          class={style.textarea}
        >
          about
        </textarea>
      </div>
      <div class={style.footbar}>
        <button
          class={style.button}
          onclick={() => {
            restartAnimation(centerRef);
            restartAnimation(rightRef);
            restartAnimation(continueRef);
            setShownPage(shownPage() === 0 ? 0 : shownPage() - 1);
          }}
        >
          Back
        </button>
        <button
          class={style.buttoncontinue}
          ref={continueRef!}
          onclick={() => {
            restartAnimation(centerRef);
            restartAnimation(rightRef);
            restartAnimation(continueRef);
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
