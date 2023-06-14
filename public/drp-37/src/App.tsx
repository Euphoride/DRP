import { Component, createEffect, createSignal } from "solid-js";
import { reminderHandlerGenerator } from "./reminders/Reminders";

import styles from "./App.module.css";
import { A } from "@solidjs/router";
import { otherName } from "./messages/Message";

const TWO_MINUTES_MILLI = 120000;
const TWO_HOURS_MILLI = 7.2e6;
const TWO_DAYS_MILLI = 1.728e8;

export const App: Component<{ name: string }> = (props) => {
  // const [data, { refetch }] = createResource(getRemindMes);

  const [remindDate, setRemindDate] = createSignal(new Date().toString());

  let textRef: HTMLTextAreaElement | undefined = undefined;
  let dateRef: HTMLInputElement | undefined = undefined;

  const customReminderHandler = async () => {
    const refValue = dateRef!.value;

    alert("Saved Reminder");

    const requestedTime = new Date(refValue).getTime();
    const currentTime = new Date().getTime();

    await reminderHandlerGenerator(requestedTime - currentTime, textRef)();
  };

  const updateDateRefHandler = (time: number): (() => void) => {
    return () => {
      const currentTime = new Date().getTime();
      const calculatedTime = new Date(currentTime + time);

      calculatedTime.setMinutes(
        calculatedTime.getMinutes() - calculatedTime.getTimezoneOffset()
      );

      setRemindDate(calculatedTime.toISOString().slice(0, 16));
    };
  };

  createEffect(() => {
    dateRef!.value = remindDate();
  });
  return (
    <div class={styles.App}>
      <div>
        <h3>Remind me to check in with {otherName(props.name)}</h3>
        <textarea
          ref={textRef!}
          style={{ height: "5vh", width: "60vw" }}
          class={styles.textarea}
          onClick={() =>
            (textRef!.value =
              textRef!.value == "about how the interview went"
                ? "about "
                : textRef!.value)
          }
        >
          about how the interview went
        </textarea>
        <br />
        <span>in</span>
        <button
          class={styles.button}
          onClick={updateDateRefHandler(TWO_MINUTES_MILLI)}
        >
          2 minutes
        </button>
        <button
          class={styles.button}
          onClick={updateDateRefHandler(TWO_HOURS_MILLI)}
        >
          2 hours
        </button>
        <button
          class={styles.button}
          onClick={updateDateRefHandler(TWO_DAYS_MILLI)}
        >
          2 days
        </button>
        <br />
        <span>or at</span>
        <input type="datetime-local" ref={dateRef!} />
        <button
          class={styles.button}
          onClick={customReminderHandler}
          style={{ "margin-bottom": "2vh" }}
        >
          Remind me!
        </button>
      </div>
      <br />
    </div>
  );
};

export const ReminderPage: Component<{ name: string }> = (props) => {
  return (
    <div style="margin-top:12vh;">
      <App name={props.name} />
      <p>space to display things</p>
    </div>
  );
};

export default App;
