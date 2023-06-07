import { Component } from "solid-js";
import {
  PushedNotificationRecord,
  arePushNotificationsSupported,
  getPermission,
  postRemindMe,
  registerServiceWorker,
  sendSubscription,
  subscribeToNotifications,
} from "../notifications/Notification";

const pushServerPublicKey =
  "BPzRQuykU54y1FC49qgSbG-K9zENnbPWQzfWqDMqdx_zUN5fvFokHe1PCe34n_LrztdW7RKr7BG1tfgelSQzpT8";

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

    var message = "Reminder to text Carl";
    // if the textbox not just contains about or is empty
    if ((messageBox?.value || "about ") != "about ") {
      message += " ";
      message += messageBox?.value;
    }
    alert(message);
    const pushSub = await subscribeToNotifications(pushServerPublicKey);
    await sendSubscription(
      pushSub,
      message,
      delta
    );
    alert("Saved \""+message+"\"");
  };
};
