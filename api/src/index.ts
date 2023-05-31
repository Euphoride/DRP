import express from "express";
import { setupTeapotRoute } from './routes/teapot';
import { setupDefaultRoute } from './routes/default';
import { setupRemindmeGetRoute, setupRemindmePostRoute } from './routes/remindme';

const app = express();

app.use(express.json());

setupRemindmeGetRoute(app);
setupRemindmePostRoute(app);
setupTeapotRoute(app);
setupDefaultRoute(app);

app.use(express.static("../public/drp-37/dist"));

// Heroku provides port using env variables apparently...
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is now listening for connections on port ${port}! :3`);
});