import express from "express";

const app = express();

app.get("/api", (_, res) => {
  res.writeHead(200);
  res.write("Hello World! I am the API.");
  res.end();
})

app.use(express.static("../public/drp-37/dist"));

// Heroku provides port using env variables apparently...
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log("Server is now listening for connections on port 80! :3");
})