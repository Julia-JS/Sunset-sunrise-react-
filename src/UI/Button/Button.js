import React from "react";
import "./Button.css";

const button = (props) => {
  return <button className="Button"
                 disabled={props.disabled}
                 onClick={props.clicked}>
          {props.text}
         </button>;
};

export default button;
