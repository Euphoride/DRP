import { Component, createResource } from 'solid-js';
import { PushedNotificationRecord, arePushNotificationsSupported, getPermission, getRemindMes, postRemindMe, registerServiceWorker, sendSubscription, subscribeToNotifications } from './notifications/Notification';

import styles from './App.module.css';



const RemindMe: Component<PushedNotificationRecord> = (props) => {
  const string_date = props.date_posted.toString();

  return (
    <div class = {styles.RemindMe}>
      Remind Me with ID {props.id} and posted at {string_date}
    </div>
  )
}

const pushServerPublicKey = "BPzRQuykU54y1FC49qgSbG-K9zENnbPWQzfWqDMqdx_zUN5fvFokHe1PCe34n_LrztdW7RKr7BG1tfgelSQzpT8";

const App: Component = () => {
  const [data, { refetch }] = createResource(getRemindMes);

  let ref: HTMLTextAreaElement | undefined = undefined;

  const clickEventHandler = async () => {
    await postRemindMe(new Date());

    if (arePushNotificationsSupported()) {
      getPermission().then(_ => {
        registerServiceWorker();
      });
    }

    const pushSub = await subscribeToNotifications(pushServerPublicKey);
    await sendSubscription(pushSub, ref?.value || "Generic reminder! :)");
    refetch();
  }


  return (
    <div class={styles.App}>
      <div class={styles.Form}>
        <p>Click the button below to start a new RemindMe. You should be notified in 60 seconds.</p>
        <textarea ref={ref!} style = {{height: "5vh", width: "40vw"}}></textarea>
        <br/>
        <button onClick={clickEventHandler} style={{"margin-bottom": "2vh"}}>Start new RemindMe</button>  
      </div>

      { 
        data.loading && <p>The timestamps are loading...</p>
      }

      {
        data() && data()?.reverse().map(item => (<RemindMe id={item.id} date_posted={item.date_posted}></RemindMe>))
      }
    </div>
  );
};

export default App;
