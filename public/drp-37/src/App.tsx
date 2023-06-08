import { Component, createEffect, createSignal } from "solid-js";
import { reminderHandlerGenerator } from "./reminders/Reminders";

import styles from "./App.module.css";
import { A } from "@solidjs/router";

const TWO_MINUTES_MILLI = 120000;
const TWO_HOURS_MILLI = 7.2e6;
const TWO_DAYS_MILLI = 1.728e8;

const App: Component = () => {
  // const [data, { refetch }] = createResource(getRemindMes);

  const [remindDate, setRemindDate] = createSignal(new Date().toString());

  let textRef: HTMLTextAreaElement | undefined = undefined;
  let dateRef: HTMLInputElement | undefined = undefined;

  const customReminderHandler = async () => {
    const refValue = dateRef!.value;

    alert('Saved "' + refValue + '"');

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
        <h3>You can set reminders here! Set a message and a date :)</h3>
        <p>Remind me to text Carl</p>
        <textarea
          ref={textRef!}
          style={{ height: "5vh", width: "60vw" }}
          class={styles.textarea}
        >
          about
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
      <A href="/">To Index</A>
    </div>
  );
};

export default App;
