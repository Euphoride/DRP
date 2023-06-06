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
        <p>You can set reminders here! Set a message and a date :)</p>
        <p>Remind me to text Carl</p>
        <textarea
          ref={textRef!}
          style={{ height: "5vh", width: "40vw" }}
        >
          about  
        </textarea>
        <br />
        <label>in</label>
        <button onClick={reminderHandlerGenerator(TWO_MINUTES_MILLI, textRef)}>
          Two minutes
        </button>
        <button onClick={reminderHandlerGenerator(TWO_HOURS_MILLI, textRef)}>
          Two hours
        </button>
        <button onClick={reminderHandlerGenerator(TWO_DAYS_MILLI, textRef)}>
          Two days
        </button>
        <br />
        <label>at</label>
        <input type="datetime-local" ref={dateRef!} />
        <button
          onClick={customReminderHandler}
          style={{ "margin-bottom": "2vh" }}
        >
          Start new reminder
        </button>
      </div>
    </div>
  );
};

export default App;
