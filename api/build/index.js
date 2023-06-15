"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const teapot_1 = require("./routes/teapot");
const default_1 = require("./routes/default");
const remindme_1 = require("./routes/remindme");
const subscribe_1 = require("./routes/subscribe");
const messaging_1 = require("./routes/messaging");
const contacts_1 = require("./routes/contacts");
const notes_1 = require("./routes/notes");
const app = (0, express_1.default)();
app.use(express_1.default.json());
(0, subscribe_1.setupNotificationRoute)(app);
(0, remindme_1.setupRemindmeGetRoute)(app);
(0, remindme_1.setupRemindmePostRoute)(app);
(0, messaging_1.setupMessageRoute)(app);
(0, messaging_1.setupMessagePostRoute)(app);
(0, teapot_1.setupTeapotRoute)(app);
(0, default_1.setupDefaultRoute)(app);
(0, contacts_1.setupContactRoute)(app);
(0, notes_1.setupNotesPostRoute)(app);
(0, notes_1.setupNotesGetRoute)(app);
app.use(express_1.default.static("../public/drp-37/dist"));
// Heroku provides port using env variables apparently...
const port = process.env.PORT || 3000;
(0, messaging_1.setupWebsocket)(app.listen(port, () => {
    console.log(`Server is now listening for connections on port ${port}! :3`);
}));
