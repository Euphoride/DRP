import { Component, createResource } from 'solid-js';

import logo from './logo.svg';
import styles from './App.module.css';

type PushedNotificationRecord = {
  id: number,
  date_posted: Date
};

async function getRemindMes(): Promise<PushedNotificationRecord[]> {
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
  
  const data: PushedNotificationRecord[] = raw_data.message?.flat_map((item: any) => {
    if (!item.id || !item.date_posted) return [];

    return [{id: item.id as number, date_posted: new Date(item.date_posted as string)}];
  }) || [];

  return data;
}

async function postRemindMe(timestamp: Date): Promise<void> {
  await fetch("/api/remindme", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({timestamp: timestamp.getTime() / 1000})
  });
}

function arePushNotificationsSupported(): boolean {
  return "serviceWorker" in navigator && "PushManager" in window;
}

function getPermission(): Promise<NotificationPermission> {
  return Notification.requestPermission(x => x);
}

function sendRemindMeNotification() {
  const image = "/assets/71ggBUmny9L.jpg";
  const text = "This is your reminder!";
  const title = "Remind Me";

  const options = {
    body: text,
    icon: image,
    vibrate: [200, 100, 200],
    tag: "remind-me",
    image: image,
    badge: image,
    actions:  [{ action: "Detail", title: "View", icon: "https://via.placeholder.com/128/ff0000" }]
  };

  navigator.serviceWorker.ready.then((serviceWorker) => {
    serviceWorker.showNotification(title, options);
  })
}

function registerServiceWorker() {
  navigator.serviceWorker.register("/assets/sw.js");
}

const RemindMe: Component<PushedNotificationRecord> = (props) => {
  const string_date = props.date_posted.toDateString();

  return (
    <div class = {styles.RemindMe}>
      Remind Me with ID {props.id} and posted at {string_date}
    </div>
  )
}

const App: Component = () => {
  const [data, { mutate, refetch }] = createResource(getRemindMes);

  const remindmes = (data.loading) ?
    (<p>The resource is currently loading...</p>)
    :
    data()?.map(item => (<RemindMe id={item.id} date_posted={item.date_posted}></RemindMe>));

  const clickEventHandler = async () => {
    await postRemindMe(new Date())
  }

  return (
    <div class={styles.App}>
      { 
        remindmes
      }
      <div class={styles.Form}>
        <p>Click the button below to start a new RemindMe. You should be notified in 10 minutes.</p>
        <button onClick={clickEventHandler}>Start new RemindMe</button>  
      </div>
    </div>
  );
};

export default App;
