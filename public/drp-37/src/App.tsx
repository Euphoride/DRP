import { Component, createResource } from "solid-js";
import {
  PushedNotificationRecord,
  arePushNotificationsSupported,
  getPermission,
  getRemindMes,
  postRemindMe,
  registerServiceWorker,
  sendSubscription,
  subscribeToNotifications,
} from "./notifications/Notification";

import { reminderHandlerGenerator } from "./reminders/Reminders";

import styles from "./App.module.css";
import { A } from "@solidjs/router";

const TWO_MINUTES_MILLI = 120000;
const TWO_HOURS_MILLI = 7.2e6;
const TWO_DAYS_MILLI = 1.728e8;

const App: Component = () => {
  // const [data, { refetch }] = createResource(getRemindMes);

  let textRef: HTMLTextAreaElement | undefined = undefined;
  let dateRef: HTMLInputElement | undefined = undefined;

  const customReminderHandler = async () => {
    const refValue = dateRef!.value;

    const requestedTime = new Date(refValue).getTime();
    const currentTime = new Date().getTime();

    await reminderHandlerGenerator(requestedTime - currentTime, textRef)();
  };

  return (
    <div class={styles.App}>
      <div>
        <h3>You can set reminders here! Set a message and a date :)</h3>
        <label>Remind me to text Carl</label>
        <textarea
          ref={textRef!}
          style={{ height: "5vh", width: "60vw" }}
          class={styles.textarea}
        >
          about  
        </textarea>
        <br />
        <label>in</label>
        <button class={styles.button} onClick={reminderHandlerGenerator(TWO_MINUTES_MILLI, textRef)}>
          2 minutes
        </button>
        <button class={styles.button} onClick={reminderHandlerGenerator(TWO_HOURS_MILLI, textRef)}>
          2 hours
        </button>
        <button class={styles.button} onClick={reminderHandlerGenerator(TWO_DAYS_MILLI, textRef)}>
          2 days
        </button>
        <br />
        <label>or at</label>
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
      <A href = "/">To Index</A>
    </div>
  );
};

export default App;
