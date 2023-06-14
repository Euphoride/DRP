import { Client } from "pg";
import { Express } from "express";
import { establishDatabaseConnection } from "./common";

type NoteRecord = {
  sender: string;
  recipient: string;
  note: string;
  timestamp: number;
};

async function sendNote(
  sender: string,
  recipient: string,
  note: string,
  timestamp: number,
  client: Client
): Promise<Boolean> {
  return new Promise((resolve, _) => {
    client.query(
      "INSERT INTO notes (sender, recipient, notes, timestamp) VALUES ($1, $2, $3, $4)",
      [sender, recipient, note, timestamp],
      (err, _) => {
        resolve(!err);
      }
    );
  });
}

async function getNotes(client: Client): Promise<NoteRecord[]> {
  return new Promise((resolve, reject) => {
    client.query("SELECT * FROM notes", [], (err, res) => {
      if (err) reject(err);

      const records: NoteRecord[] = res.rows.map((item) => {
        if (!item.sender || !item.recipient || !item.note || !item.timestamp)
          reject();

        return {
          sender: item.sender as string,
          recipient: item.recipient as string,
          note: item.note as string,
          timestamp: item.timestamp as number,
        };
      });

      resolve(records);
    });
  });
}

export function setupNotesPostRoute(app: Express): void {
  app.post("/api/notes", async (req, res) => {
    if (
      !req.body.timestamp ||
      !req.body.sender ||
      !req.body.note ||
      !req.body.recipient
    ) {
      res.writeHead(422);
      res.write("Could not handle request due to lack of timestamp");
      res.end();
      return;
    }

    const timestamp: number = req.body.timestamp;
    const sender: string = req.body.sender;
    const recipient: string = req.body.recipient;
    const note: string = req.body.note;

    const client = await establishDatabaseConnection();

    const result = await sendNote(sender, recipient, note, timestamp, client);

    client.end();

    res.json({ message: result });
  });
}
