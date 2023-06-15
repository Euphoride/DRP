import { A } from "@solidjs/router";
import { Component } from "solid-js";

import styles from "./Navigation.module.css";
import logo from "../assets/Logo word.png";

const NavPage: Component = () => {
  return (
    <div class={styles.Navigation}>
      <img style="width: 70vw; padding-top: 20vh" src={logo} />

      <h4> I am: </h4>
      <A href="/alex" style="text-decoration: none">
        {" "}
        <button class={styles.accent_button}>Alex</button>{" "}
      </A>
      <A href="/betty" style="text-decoration: none">
        {" "}
        <button class={styles.accent_button}>Betty</button>{" "}
      </A>
      <A href="/carl" style="text-decoration: none">
        {" "}
        <button class={styles.accent_button}> Carl</button>{" "}
      </A>
      <A href="/derek" style="text-decoration: none">
        {" "}
        <button class={styles.accent_button}>Derek</button>{" "}
      </A>
    </div>
  );
};
export default NavPage;
