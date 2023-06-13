/* @refresh reload */
import { render } from "solid-js/web";
import { Component } from "solid-js";
import { Router, Route, Routes, useParams } from "@solidjs/router";

import "./index.css";
import App from "./App";
import MessagePage from "./messages/Message";
import NavPage from "./navigation/Navigation";
import PersonPage from "./navigation/PersonHome";
import ReflectionPage from "./reflection/Reflection";

const root = document.getElementById("root");

const AlexPage: Component = () => {
  return <PersonPage name="Alex" />;
};

const CarlPage: Component = () => {
  return <PersonPage name="Carl" />;
};

const BettyPage: Component = () => {
  return <PersonPage name="Betty" />;
};

const DerekPage: Component = () => {
  return <PersonPage name="Derek" />;
};

const ChatPage: Component = () => {
  const params = useParams<{ me: string; them: string }>();
  return <MessagePage me={params.me} them={params.them} />;
};

const TestReflection: Component = () => {
  return <ReflectionPage name="Alex" about="Carl" />;
};

const Routing: Component = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" component={NavPage} />
        <Route path="/alex" component={AlexPage} />
        <Route path="/carl" component={CarlPage} />
        <Route path="/betty" component={BettyPage} />
        <Route path="/derek" component={DerekPage} />
        <Route path="/:me/:them" component={ChatPage} />
        <Route path="/alex/chat" component={AlexChatPage} />
        <Route path="/carl/chat" component={CarlChatPage} />
        <Route path="/reflection" component={TestReflection} />
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
