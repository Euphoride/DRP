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
  date_posted: number;
  recipient: string;
  about_person: string;
  about_content: string;
};

export async function postRemindMe(
  timestamp: number,
  recipient: string,
  about_person: string,
  about_content: string
): Promise<void> {
  await fetch("/api/remindme", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ timestamp, recipient, about_person, about_content }),
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
