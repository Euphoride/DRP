import type { Component } from 'solid-js';
import { createSignal } from "solid-js" 

import logo from './logo.svg';
import styles from './App.module.css';

const App: Component = () => {
  const [string, setString] = createSignal("Please press the button!");
  return (
    <div class={styles.App}>
      <header class={styles.header}>
        <img src={logo} class={styles.logo} alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload. Testing whether changes are reflected.
        </p>
        <a
          class={styles.link}
          href="https://github.com/solidjs/solid"
          target="_blank"
          rel="noopener noreferrer"
        >
          Hello world!
        </a>
        <p> {string()}</p>
        <button onClick={[setString, "Thanks for pressing the button"]}> create reminder </button>
      </header>
    </div>
  );
};

export default App;
