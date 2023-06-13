import { Express } from "express";
import { establishDatabaseConnection } from "./common";
import { Client } from "pg";
import WebSocket from "ws";
import { Server } from "http";
type MessageRecord = {
  from: string;
  to: string;
  content: string;
  time: number;
};

export async function getMessages(client: Client): Promise<MessageRecord[]> {
  return new Promise((resolve, reject) => {
    client.query("SELECT * FROM messages", (err, res) => {
      if (err) reject(err);

      const records: MessageRecord[] = res.rows.map((item) => {
        if (!item.sender || !item.message || !item.to || !item.time)
          reject(JSON.stringify(item));

        return {
          from: item.sender as string,
          to: item.to as string,
          content: item.message as string,
          time: item.time as number,
        };
      });

      resolve(records);
    });
  });
}

export function setupMessageRoute(app: Express): void {
  app.get("/api/messages", async (_, res) => {
    const client = await establishDatabaseConnection();
    const records = await getMessages(client);

    client.end();

    res.json({
      message: records,
    });
  });
}

async function sendMessage(
  from: string,
  content: string,
  client: Client
): Promise<Boolean> {
  return new Promise((resolve, _) => {
    client.query(
      "INSERT INTO messages (sender, message) VALUES ($1, $2)",
      [from, content],
      (err, _) => {
        resolve(!err);
      }
    );
  });
}

export function setupMessagePostRoute(app: Express): void {
  app.post("/api/messages", async (req, res) => {
    if (!req.body.from || !req.body.content) {
      res.writeHead(422);
      res.write("Could not handle request due to malformed query");
    }

    const from = req.body.from;
    const content = req.body.content;

    const client = await establishDatabaseConnection();

    const result = await sendMessage(from, content, client);

    client.end();

    res.json({ message: result });
  });
}

export function setupWebsocket(server: Server) {
  const wss = new WebSocket.Server({ server });

  wss.on("connection", (ws) => {
    ws.on("message", (message) => {
      wss.clients.forEach((client) => {
        client.send(message);
      });
    });
  });
}
