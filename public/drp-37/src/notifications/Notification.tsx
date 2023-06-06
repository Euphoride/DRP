export function arePushNotificationsSupported(): boolean {
  return "serviceWorker" in navigator && "PushManager" in window;
}

export function getPermission(): Promise<NotificationPermission> {
  return Notification.requestPermission((x) => x);
}

export function registerServiceWorker() {
  navigator.serviceWorker.register("/sw.js");
}

export type PushedNotificationRecord = {
  id: number;
  date_posted: Date;
};

export async function getRemindMes(): Promise<PushedNotificationRecord[]> {
  const response = await fetch("/api/remindme");
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
      if (!item.id || !item.date_posted) return [];

      return [
        {
          id: item.id as number,
          date_posted: new Date(item.date_posted as string),
        },
      ];
    }) || [];

  return data;
}

export async function postRemindMe(timestamp: Date): Promise<void> {
  await fetch("/api/remindme", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ timestamp: timestamp.getTime() / 1000 }),
  });
}

export async function subscribeToNotifications(
  pushServerPublicKey: string
): Promise<PushSubscription> {
  return navigator.serviceWorker.ready.then(async (sw) => {
    const subscription = await sw.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: pushServerPublicKey,
    });

    return subscription;
  });
}

export async function sendSubscription(
  subscription: PushSubscription,
  customText: string,
  time: number
) {
  await fetch("/api/subscribe", {
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      subscription: subscription,
      text: customText,
      time: time,
    }),
    method: "POST",
  });
}
