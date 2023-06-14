import { A } from "@solidjs/router";
import { Component } from "solid-js";

import styles from "./Navigation.module.css";

const NavPage: Component = () => {
  return (
    <div class={styles.Navigation}>
      <h1 style="color:blue;">Closer</h1>

      <h4> I am: </h4>
      <A href="/alex">
        {" "}
        <button>Alex</button>{" "}
      </A>
      <A href="/carl">
        {" "}
        <button> Carl</button>{" "}
      </A>
      <A href="/reflection">
        {" "}
        <button> Reflection Test</button>{" "}
      </A>
    </div>
  );
};
export default NavPage;
