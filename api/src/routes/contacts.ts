import { Express } from "express";
import { Client } from "pg";
import { establishDatabaseConnection } from "./common";
import { getMessages } from "./messaging";

async function getContacts(client: Client, name: string): Promise<string[]> {
  return new Promise((resolve, _) => {
    resolve(["Alex", "Carl", "Betty", "Derek"]);
  });
}

async function listContacts(name: string): Promise<string[]> {
  const client = await establishDatabaseConnection();
  const contacts = await getContacts(client, name);
  const messages = await getMessages(client);
  client.end();

  // So what we need to do here is grab all the messaages from us, map them to
  // (contact, date sent) pairs, and reduce these to (contact, max date sent)

  const contactsWithTime: Array<{ contact: string; time: number }> = messages
    .filter((m) => m.sender == name)
    .map((record) => {
      return {
        contact: record.recipient,
        time: record.timestamp,
      };
    });

  contactsWithTime.sort((a, b) => b.time - a.time);

  const contactMap = new Map();

  contactsWithTime.forEach((item) => {
    if (!contactMap.get(item.contact)) {
      contactMap.set(item.contact, item.time);
    }
  });

  const computedContactsWithTime = Array.from(contactMap, ([key, value]) => ({
    key,
    value,
  }));

  computedContactsWithTime.reverse();

  const computedListedContacts: string[] = computedContactsWithTime.map(
    (i) => i.key
  );

  const unmentionedContacts = contacts.filter(
    (item) => !computedListedContacts.includes(item)
  );

  const listedContacts = Array.from(
    new Set([...unmentionedContacts, ...computedListedContacts])
  );

  return new Promise((resolve, _) => {
    resolve(listedContacts.filter((item) => item != name));
  });
}

export function setupContactRoute(app: Express): void {
  app.get("/api/contacts", async (req, res) => {
    if (!req.query.name) {
      res.writeHead(422);
      res.write("Could not handle request due to malformed query");
      res.end();
      return;
    }
    const name = req.query.name as string;
    const contacts = await listContacts(name);

    res.json({
      message: contacts,
    });
  });
}
