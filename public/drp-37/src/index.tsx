/* @refresh reload */
import { render } from "solid-js/web";
import { Component } from "solid-js";
import { Router, Route, Routes } from "@solidjs/router";

import "./index.css";
import App from "./App";
import MessagePage from "./messages/Message";
import NavPage from "./navigation/Navigation";
import PersonPage from "./navigation/PersonHome";

const root = document.getElementById("root");

const AlexPage: Component = () => {
  return <PersonPage name="Alex" />;
};

const CarlPage: Component = () => {
  return <PersonPage name="Carl" />;
};

const AlexChatPage: Component = () => {
  return <MessagePage name="Alex" />;
};

const CarlChatPage: Component = () => {
  return <MessagePage name="Carl" />;
};

const Routing: Component = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" component={NavPage} />
        <Route path="/app" component={App} />
        <Route path="/alex" component={AlexPage} />
        <Route path="/carl" component={CarlPage} />
        <Route path="/alex/chat" component={AlexChatPage} />
        <Route path="/carl/chat" component={CarlChatPage} />
      </Routes>
    </Router>
  );
};

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    "Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got mispelled?"
  );
}

render(() => <Routing />, root!);
