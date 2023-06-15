import {
  PushedNotificationRecord,
  arePushNotificationsSupported,
  getPermission,
  postRemindMe,
  registerServiceWorker,
  sendSubscription,
  subscribeToNotifications,
} from "../notifications/Notification";

import {
  Component,
  createEffect,
  createResource,
  createSignal,
} from "solid-js";

import styles from "./reminders.module.css";
const pushServerPublicKey =
  "BPzRQuykU54y1FC49qgSbG-K9zENnbPWQzfWqDMqdx_zUN5fvFokHe1PCe34n_LrztdW7RKr7BG1tfgelSQzpT8";

const TWO_MINUTES_MILLI = 120000;
const TWO_HOURS_MILLI = 7.2e6;
const TWO_DAYS_MILLI = 1.728e8;

export const RemindMe: Component<PushedNotificationRecord> = (props) => {
  const date = props.date_posted;
  const dateString = new Date(date / 1000).toDateString();
  const about_content = props.about_content;

  const now = new Date().getTime();

  return (
    <div style={{ "text-align": "center" }}>
      You set reminder to talk {about_content} on {dateString}
    </div>
  );
};

export const reminderHandlerGenerator = (
  delta: number,
  recipient: string,
  about_person: string,
  messageBox: HTMLTextAreaElement | undefined
): (() => Promise<void>) => {
  return async () => {
    await postRemindMe(
      new Date().getTime(),
      recipient,
      about_person,
      messageBox!.value
    );

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
  me: string;
  them: string;
  callback: () => boolean | void;
}> = (props) => {
  const [remindDate, setRemindDate] = createSignal(new Date().toString());

  let textRef: HTMLTextAreaElement | undefined = undefined;
  let dateRef: HTMLInputElement | undefined = undefined;

  const customReminderHandler = async () => {
    const refValue = dateRef!.value;

    alert("Saved Reminder");

    const requestedTime = new Date(refValue).getTime();
    const currentTime = new Date().getTime();

    await reminderHandlerGenerator(
      requestedTime - currentTime,
      props.me,
      props.them,
      textRef
    )();
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
          Remind me to check in with {props.them}
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

const getRemindMes = (name: string) => {
  return async () => {
    const now = new Date().getTime();
    const response = await fetch(`/api/remindme?timestamp=${now}&name=${name}`);
    const raw_data = await response.json();

    // This guy here is meant to be validating the type of the data we just fetched.
    // Does this a couple of ways:
    //   1. The option chaining on message defaults to null rather than an exception if
    //      message doesn't exist. || [] means that if it is null, the default value it
    //      should take is the empty list.
    //   2. We flatmap because its easy to return an "empty" (None in Maybe) case of
    //      "this record didn't fit the type but i want to check the next ones".
    // Thank God for monads.

    const data: PushedNotificationRecord[] =
      raw_data.message?.flatMap((item: any) => {
        if (
          !item.id ||
          !item.date_posted ||
          !item.recipient ||
          !item.about_person ||
          !item.about_content
        )
          return [];

        return [
          {
            id: item.id as number,
            date_posted: item.date_posted as number,
            recipient: item.recipient as string,
            about_person: item.about_person as string,
            about_content: item.about_content as string,
          },
        ];
      }) || [];

    return data;
  };
};

export const ReminderPage: Component<{
  me: string;
  them: string;
  callback: () => boolean | void;
}> = (props) => {
  const [remindmes, { mutate, refetch }] = createResource(
    getRemindMes(props.me)
  );

  return (
    <div style="margin-top:12vh;">
      <ReminderInput
        them={props.them}
        me={props.me}
        callback={props.callback}
      />

      {remindmes() &&
        remindmes()?.map((item) => {
          return (
            <RemindMe
              date_posted={item.date_posted}
              id={item.id}
              recipient={item.recipient}
              about_person={item.about_person}
              about_content={item.about_content}
            />
          );
        })}
    </div>
  );
};
