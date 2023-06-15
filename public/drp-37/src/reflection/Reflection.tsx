import { Component, createSignal } from "solid-js";
import { A } from "@solidjs/router";

import style from "./refection.module.css";
import { getNote, notesFocusOutHandler } from "../messages/Message";

const restartAnimation = (
  divElement: HTMLDivElement | HTMLButtonElement | undefined
) => {
  if (divElement) {
    divElement.style.animation = "none";
    divElement.offsetHeight;
    divElement.style.animation = "";
  }
};

const PlainPage: Component<{
  ref: HTMLDivElement | undefined;
  message: string;
}> = (props) => {
  return (
    <div>
      <div ref={props.ref!} class={style.reflection_message}>
        {props.message}
      </div>
    </div>
  );
};

const reachOutFrequency = (input: string) => {
  var message: string = "";
  switch (input) {
    case "1":
      message = "after 1 week";
      break;
    case "2":
      message = "after 2 weeks";
      break;
    case "3":
      message = "after 1 month";
      break;
    case "4":
      message = "after 2 months";
      break;
    default:
      message = "Something went wrong";
  }
  return message;
};

const FrequencyInput: Component = () => {
  let sliderRef: HTMLInputElement | undefined = undefined;
  let labelRef: HTMLOutputElement | undefined = undefined;
  return (
    <div>
      <input
        oninput={() =>
          (labelRef!.textContent = reachOutFrequency(sliderRef!.value))
        }
        type="range"
        min="1"
        max="4"
        value="2"
        class={style.slider}
        ref={sliderRef!}
      />
      <output style="display:block;" ref={labelRef!}>
        {reachOutFrequency("2")}
      </output>
    </div>
  );
};

const reflectionPrompt = (name: string, about: string, index: number) => {
  var message: string = "";
  switch (index) {
    case 0:
      message =
        "Hello " +
        name +
        ", let's reflect on your relationship with " +
        about +
        ".";
      break;
    case 1:
      message =
        "Who is " +
        about +
        " to you? What do you appreciate about them? What special memories do you share?";
      break;
    case 2:
      message = "When was the last time you met? When did you last chat?";
      break;
    case 3:
      message = "Who were you then? What has changed in your life since then?";
      break;
    case 4:
      message =
        "What has gotten in the way of reaching out and connecting? How do you want to combat that?";
      break;
    case 5:
      message =
        "After how long would you like to be reminded to reach out to " +
        about +
        "?";
      break;
    default:
      message = "Something went wrong";
  }
  return message;
};

const saveReflectionTimestamp = (name: string, about: string) => {
  return async () => {
    const note = await getNote(name, about)();

    const text =
      (await note.json()).message.note +
      "\n\n\nReflection on: " +
      new Date().toDateString() +
      "\n\n";
    notesFocusOutHandler(name, about, text);
  };
};

const updateNotes = (
  name: string,
  about: string,
  prompt: string,
  ref: HTMLTextAreaElement | undefined
) => {
  return async () => {
    const note = await getNote(name, about)();

    const text =
      (await note.json()).message.note +
      `

Q: ${prompt}
A: ${ref?.value || ""}
      `;
    if (ref) {
      ref.value = "";
    }
    notesFocusOutHandler(name, about, text);
  };
};

const ReflectionPage: Component<{ name: string; about: string }> = (props) => {
  const [shownPage, setShownPage] = createSignal(0);

  let continueRef: HTMLButtonElement | undefined = undefined;
  let promptRef: HTMLDivElement | undefined = undefined;
  let textRef: HTMLTextAreaElement | undefined = undefined;

  return (
    <div>
      <div class={style.barcontainer}>
        <div class={style.square}></div>
      </div>
      <div class={style.container}>
        {shownPage() <= 5 && (
          <PlainPage
            ref={promptRef}
            message={reflectionPrompt(props.name, props.about, shownPage())}
          />
        )}
      </div>
      <div class={style.text_area_container}>
        {shownPage() == 5 && <FrequencyInput />}
        {shownPage() != 5 && shownPage() != 0 && (
          <textarea
            ref={textRef!}
            style={{ height: "19vh", width: "80vw" }}
            class={style.textarea}
            onFocusOut={() => {
              updateNotes(
                props.name,
                props.about,
                reflectionPrompt(props.name, props.about, shownPage()),
                textRef
              )();
            }}
          ></textarea>
        )}
      </div>
      <div class={style.footbar}>
        {shownPage() > 0 && (
          <button
            class={style.button}
            onclick={() => {
              restartAnimation(continueRef);
              restartAnimation(promptRef);
              setShownPage(shownPage() === 0 ? 0 : shownPage() - 1);
            }}
          >
            Back
          </button>
        )}
        {shownPage() == 0 && (
          <A href={"/" + props.name}>
            {" "}
            <button class={style.button}>Back</button>{" "}
          </A>
        )}
        {shownPage() != 5 && shownPage() != 0 && (
          <div>
            <button
              class={style.buttoncontinue}
              onclick={() => {
                restartAnimation(continueRef);
                restartAnimation(promptRef);
                setShownPage(shownPage() == 5 ? 5 : shownPage() + 1);
              }}
            >
              continue
            </button>
            <button
              class={style.buttoncontinuecover}
              ref={continueRef!}
              onclick={() => {
                restartAnimation(continueRef);
                restartAnimation(promptRef);
                setShownPage(shownPage() == 5 ? 5 : shownPage() + 1);
              }}
            ></button>
          </div>
        )}
        {shownPage() == 0 && (
          <button
            class={style.buttoncontinue}
            ref={continueRef!}
            onclick={() => {
              saveReflectionTimestamp(props.name, props.about)();
              restartAnimation(continueRef);
              restartAnimation(promptRef);
              setShownPage(shownPage() == 5 ? 5 : shownPage() + 1);
            }}
          >
            begin
          </button>
        )}
        {shownPage() == 5 && (
          <A href={"/" + props.name}>
            <button class={style.buttoncontinue}>Finish</button>{" "}
          </A>
        )}
      </div>
    </div>
  );
};

export default ReflectionPage;
