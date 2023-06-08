import { Client } from "pg";

export async function establishDatabaseConnection(): Promise<Client> {
  const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD, ENDPOINT_ID } = process.env;

  const URL = `postgres://${PGUSER}:${PGPASSWORD}@${PGHOST}/${PGDATABASE}?options=project%3D${ENDPOINT_ID}&ssl=true`;

  const client = new Client({ connectionString: URL });
  await client.connect();

  return client;
}
