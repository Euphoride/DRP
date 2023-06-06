import { Express } from "express";

export function setupTeapotRoute(app: Express): void {
  app.get("/api/teapot", (_, res) => {
    res.writeHead(418);
    res.write("I'm a teapot!");
    res.end();
  });
}
