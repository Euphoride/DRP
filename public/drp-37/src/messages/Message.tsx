// message mock
import { Component } from "solid-js";
import {A} from "@solidjs/router";

import chatPicture from "../assets/chat.png";

const Message: Component = () => {
  return (
    <div> 
      <A href="/app"> Reminders </A><br/>
      <img src={chatPicture} alt="Picture of chat" />
    </div>
  )
}

export default Message;
