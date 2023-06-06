import { Express } from "express";
import webpush from "web-push";

const tenminutes = 1000 * 60 * 1; // This is actually one minute!

const vapidKeys = {
  privateKey: "kj20ptH4_r6RMCKrSwFdbcqI5dVWIHxxaYeVILS6xWA",
  publicKey:
    "BPzRQuykU54y1FC49qgSbG-K9zENnbPWQzfWqDMqdx_zUN5fvFokHe1PCe34n_LrztdW7RKr7BG1tfgelSQzpT8",
};

export function setupNotificationRoute(app: Express): void {
  webpush.setVapidDetails(
    "https://example@domain.org",
    vapidKeys.publicKey,
    vapidKeys.privateKey
  );

  app.post("/api/subscribe", (req, res) => {
    const pushSubscription = req.body.subscription;
    const text = req.body.text;
    const time = req.body.time;

    setTimeout(() => {
      webpush.sendNotification(pushSubscription, text);
      console.log(`Sent notification: ${text} with ETA ${time} seconds`);
    }, time);

    res.writeHead(200);
    res.write("Notification subscribed!");
    res.end();
  });
}
