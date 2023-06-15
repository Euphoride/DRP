import { Express } from "express";
import { Client } from "pg";

import dotenv from "dotenv";
import { establishDatabaseConnection } from "./common";

dotenv.config();

type PushedNotificationRecord = {
  id: number;
  date_posted: number;
  recipient: string;
  about_person: string;
  about_content: string;
};

const millisecondScalingFactor = 1000;

async function sendRemindMe(
  timestamp: number,
  recipient: string,
  about_person: string,
  about_content: string,
  client: Client
): Promise<Boolean> {
  return new Promise((resolve, _) => {
    client.query(
      "INSERT INTO pushednotifications (date_posted, recipient, about_person, about_content) VALUES ($1, $2, $3, $4)",
      [timestamp, recipient, about_person, about_content],
      (err, _) => {
        resolve(!err);
      }
    );
  });
}

async function getRemindMes(
  client: Client,
  timestamp: number,
  name: string
): Promise<PushedNotificationRecord[]> {
  return new Promise((resolve, reject) => {
    client.query(
      "SELECT * FROM pushednotifications WHERE recipient = $1 AND date_posted - 604800000 >= $2 ",
      [name, timestamp],
      (err, res) => {
        if (err) reject(err);

        console.log(err, res);

        const records: PushedNotificationRecord[] = res.rows.map((item) => {
          if (
            !item.id ||
            !item.date_posted ||
            !item.recipient ||
            !item.about_person ||
            !item.about_content
          )
            reject();

          return {
            id: item.id as number,
            date_posted: item.date_posted as number,
            recipient: item.recipient as string,
            about_person: item.about_person as string,
            about_content: item.about_content as string,
          };
        });

        resolve(records);
      }
    );
  });
}

export function setupRemindmePostRoute(app: Express): void {
  app.post("/api/remindme", async (req, res) => {
    if (!req.body.timestamp) {
      res.writeHead(422);
      res.write("Could not handle request due to lack of timestamp");
      res.end();
      return;
    }

    const timestamp: number = req.body.timestamp;
    const recipient: string = req.body.recipient;
    const about_person: string = req.body.about_person;
    const about_content: string = req.body.about_content;

    const client = await establishDatabaseConnection();

    const result = await sendRemindMe(
      timestamp * millisecondScalingFactor,
      recipient,
      about_person,
      about_content,
      client
    );

    client.end();

    res.json({ message: result });
  });
}

export function setupRemindmeGetRoute(app: Express): void {
  app.get("/api/remindme", async (req, res) => {
    if (
      !req.query.timestamp ||
      !req.query.name ||
      typeof req.query.timestamp != "string" ||
      typeof req.query.name != "string"
    ) {
      res.writeHead(422);
      res.write("Could not handle request due to lack of timestamp");
      res.end();
      return;
    }

    const timestamp = parseInt(req.query.timestamp);
    const name = req.query.name;

    const client = await establishDatabaseConnection();
    const remindMes = await getRemindMes(client, timestamp, name);

    client.end();

    res.json({ message: remindMes });
  });
}
