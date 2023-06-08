import express from "express";
import { setupTeapotRoute } from "./routes/teapot";
import { setupDefaultRoute } from "./routes/default";
import {
  setupRemindmeGetRoute,
  setupRemindmePostRoute,
} from "./routes/remindme";
import { setupNotificationRoute } from "./routes/subscribe";
import {
  setupMessagePostRoute,
  setupMessageRoute,
  setupWebsocket,
} from "./routes/messaging";

const app = express();

app.use(express.json());

setupWebsocket();

setupNotificationRoute(app);
setupRemindmeGetRoute(app);
setupRemindmePostRoute(app);
setupMessageRoute(app);
setupMessagePostRoute(app);
setupTeapotRoute(app);
setupDefaultRoute(app);

app.use(express.static("../public/drp-37/dist"));

// Heroku provides port using env variables apparently...
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is now listening for connections on port ${port}! :3`);
});
