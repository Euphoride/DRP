import { Express } from 'express';

export function setupDefaultRoute(app: Express): void {
  app.get("/api", (_, res) => {
    res.writeHead(200);
    res.write("Hello World! I am the API.");
    res.end();
  });
}
