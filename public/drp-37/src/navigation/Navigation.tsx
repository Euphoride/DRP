import { A } from "@solidjs/router";
import { Component } from "solid-js";

const NavPage: Component = () => {
  return (
    <div>
      <h1>Your friends</h1>
      <A href="/alex"> Carl </A>
      <A href="/carl"> Alex </A>
    </div>
  );
};
export default NavPage;
