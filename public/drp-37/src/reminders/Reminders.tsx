import {
  PushedNotificationRecord,
  arePushNotificationsSupported,
  getPermission,
  postRemindMe,
  registerServiceWorker,
  sendSubscription,
  subscribeToNotifications,
} from "../notifications/Notification";

import { Component, createEffect, createSignal } from "solid-js";

import styles from "./reminders.module.css";
const pushServerPublicKey =
  "BPzRQuykU54y1FC49qgSbG-K9zENnbPWQzfWqDMqdx_zUN5fvFokHe1PCe34n_LrztdW7RKr7BG1tfgelSQzpT8";

const TWO_MINUTES_MILLI = 120000;
const TWO_HOURS_MILLI = 7.2e6;
const TWO_DAYS_MILLI = 1.728e8;

export const RemindMe: Component<PushedNotificationRecord> = (props) => {
  const string_date = props.date_posted.toString();

  return (
    <div>
      Remind Me with ID {props.id} and posted at {string_date}
    </div>
  );
};

export const reminderHandlerGenerator = (
  delta: number,
  messageBox: HTMLTextAreaElement | undefined
): (() => Promise<void>) => {
  return async () => {
    await postRemindMe(new Date());

    if (arePushNotificationsSupported()) {
      getPermission().then((_) => {
        registerServiceWorker();
      });
    }
    const pushSub = await subscribeToNotifications(pushServerPublicKey);

    var message = "Reminder to text Carl";
    // if the textbox not just contains about or is empty
    if ((messageBox?.value || "about ") != "about ") {
      message += " ";
      message += messageBox?.value;
    }

    await sendSubscription(pushSub, message, delta);
  };
};

export const ReminderInput: Component<{
  name: string;
  callback: () => boolean | void;
}> = (props) => {
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
    <div class={styles.reminder_input}>
      <div>
        <h3 style="margin-bottom:0;">
          Remind me to check in with {props.name}
        </h3>
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
        <input type="datetime-local" ref={dateRef!} style="margin:3vw;" />
        <button
          class={styles.accent_button}
          onClick={() => {
            customReminderHandler();
            props.callback();
          }}
          style={{ "margin-bottom": "2vh" }}
        >
          Remind me!
        </button>
      </div>
      <br />
    </div>
  );
};

export const ReminderPage: Component<{
  name: string;
  callback: () => boolean | void;
}> = (props) => {
  return (
    <div style="margin-top:12vh;">
      <ReminderInput name={props.name} callback={props.callback} />
      <p>space to display things</p>
    </div>
  );
};
