import { Express } from "express";
import { establishDatabaseConnection } from "./common";
import { Client } from "pg";
import WebSocket from "ws";
import { Server } from "http";

type MessageRecord = {
  sender: string;
  recipient: string;
  message: string;
  timestamp: number;
};

export async function getMessages(client: Client): Promise<MessageRecord[]> {
  return new Promise((resolve, reject) => {
    client.query("SELECT * FROM messages", (err, res) => {
      if (err) reject(err);

      const records: MessageRecord[] = res.rows.map((item) => {
        if (!item.sender || !item.message || !item.recipient || !item.timestamp)
          reject(JSON.stringify(item));

        return {
          sender: item.sender as string,
          recipient: item.recipient as string,
          message: item.message as string,
          timestamp: item.timestamp as number,
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
  to: string,
  timestamp: number,
  client: Client
): Promise<Boolean> {
  return new Promise((resolve, _) => {
    client.query(
      "INSERT INTO messages (sender, message, recipient, timestamp) VALUES ($1, $2, $3, $4)",
      [from, content, to, timestamp],
      (err, _) => {
        resolve(!err);
      }
    );
  });
}

export function setupMessagePostRoute(app: Express): void {
  app.post("/api/messages", async (req, res) => {
    if (
      !req.body.sender ||
      !req.body.message ||
      !req.body.recipient ||
      !req.body.timestamp
    ) {
      res.writeHead(422);
      res.write("Could not handle request due to malformed query");
      res.end();
      return;
    }

    const from = req.body.sender;
    const content = req.body.message;
    const recipient = req.body.recipient;
    const timestamp = req.body.timestamp;

    const client = await establishDatabaseConnection();

    const result = await sendMessage(
      from,
      content,
      recipient,
      timestamp,
      client
    );

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
