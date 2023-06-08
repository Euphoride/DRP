import { Express } from "express";
import { Client } from "pg";

import dotenv from "dotenv";
import { establishDatabaseConnection } from "./common";

dotenv.config();

type PushedNotificationRecord = {
  id: number;
  date_posted: Date;
};

const millisecondScalingFactor = 1000;

async function sendRemindMe(timestamp: Date, client: Client): Promise<Boolean> {
  return new Promise((resolve, _) => {
    client.query(
      "INSERT INTO pushednotifications (date_posted) VALUES ($1)",
      [timestamp],
      (err, _) => {
        resolve(!err);
      }
    );
  });
}

async function getRemindMes(
  client: Client
): Promise<PushedNotificationRecord[]> {
  return new Promise((resolve, reject) => {
    client.query("SELECT * FROM pushednotifications", (err, res) => {
      if (err) reject();

      // One of the weird things about typescript
      // is the type of things when you fetch them from
      // some online source...
      const records: PushedNotificationRecord[] = res.rows.map((item) => {
        if (!item.id || !item.date_posted) reject();

        return {
          id: item.id as number,
          date_posted: new Date(item.date_posted as string),
        };
      });

      resolve(records);
    });
  });
}

export function setupRemindmePostRoute(app: Express): void {
  app.post("/api/remindme", async (req, res) => {
    if (!req.body.timestamp) {
      res.writeHead(422);
      res.write("Could not handle request due to lack of timestamp");
    }

    const timestamp: number = req.body.timestamp;
    const client = await establishDatabaseConnection();

    const result = await sendRemindMe(
      new Date(timestamp * millisecondScalingFactor),
      client
    );

    client.end();

    res.json({ message: result });
  });
}

export function setupRemindmeGetRoute(app: Express): void {
  app.get("/api/remindme", async (_, res) => {
    const client = await establishDatabaseConnection();
    const remindMes = await getRemindMes(client);

    client.end();

    res.json({ message: remindMes });
  });
}
