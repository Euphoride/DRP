import { Express } from "express";
import { Client } from "pg";
import { establishDatabaseConnection } from "./common";
import { getMessages } from "./messaging";

async function getContacts(client: Client, name: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    resolve(["Alex", "Carl"]);
  });
}

function compareContacts(
  a: { contact: string; time: number },
  b: { contact: string; time: number }
) {
  return a.time - b.time;
}

async function listContacts(name: string): Promise<string[]> {
  console.log("called listContacts");
  const client = await establishDatabaseConnection();
  const contacts = await getContacts(client, name);
  const messages = await getMessages(client);
  client.end();
  console.log("got messages");
  const ourMessages = messages.filter((m) => m.from == name);
  let contactsWithTime: Array<{ contact: string; time: number }>;
  contactsWithTime = [];
  for (let i = 0; i < contacts.length; i++) {
    var contact = contacts[i];
    var time = 0;
    for (let j = 0; j < ourMessages.length; j++) {
      var m = ourMessages[j];
      if (m.to == contact && m.time > time) time = m.time;
    }
    contactsWithTime.push({ contact, time });
  }
  console.log("sorting contacts");
  contactsWithTime.sort(compareContacts);
  const listedContacts = contactsWithTime.map((i) => i.contact);
  return new Promise((resolve, reject) => {
    resolve(listedContacts);
  });
}

export function setupContactRoute(app: Express): void {
  app.get("/api/contacts", async (req, res) => {
    if (!req.header.name) {
      res.writeHead(422);
      res.write("Could not handle request due to malformed query");
    }
    const name = req.header.name as string;
    const contacts = await listContacts(name);

    res.json({
      message: contacts,
    });
  });
}
