import * as React from 'react';
import { ClickAwayListener } from '@material-ui/core';
import ComSocket from '../../../communication/comsocket';

type Props = {
    section : JQuery<XMLDocument>,
}

export const Inputfield : React.FunctionComponent<Props>  = ({section})  => {
  // Open / close input element
  const [open, setOpen] = React.useState(false);
  // Set and get the actual value
  const [value, setValue] = React.useState("");
  // Define the click handler functions as null
  let handleClick : Function = null;
  let handleEnter : Function = null;

  // The expected behavior would be, that every called input field has a text-display node. Its an internal problem of the codesys project if not.
  let handleClickOutside : Function = ()=>console.log("An inputfield has no corresponding text-display field!");
  // Check which input type is allowed: 0: text 1: number 2-4: Something that isnt listed in the doku
  let type = "text";
  let minvalue = null;
  let maxvalue = null;
  if (section.children("text-input-type").text().length) {
    if(section.children("text-input-type").text()==="1"){
      type = "number";
      // Check for min max values
      if (section.children("text-input-min-expr").text().length) {
        minvalue = Number(section.children("text-input-min-expr").children("expr").children("const").text());
      }
      if (section.children("text-input-max-expr").text().length) {
        minvalue = Number(section.children("text-input-max-expr").children("expr").children("const").text());
      }
    }
  }

  if (section.children("text-display").text().length) {
    let expr = section.children("text-display").children("expr");
    if (expr.children("var").text().length){
      let varName = expr.children("var").text().toLowerCase();
      handleClickOutside = () => {
        setOpen(false);
      };
      handleClick = () => {
        setOpen(true);
      };
      handleEnter = (event : any) => {
        // Close on Enter
        if(event.keyCode == 13) {
          setOpen(false);
          ComSocket.singleton().setValue(varName, value);
        };
      };
    }
  }

    return (
      <ClickAwayListener onClickAway={ ()=>handleClickOutside()}>
        <div 
          style={{position:"absolute", width:"100%", height:"100%", pointerEvents:"auto"}} 
          onClick={handleClick === null ? null : ()=>handleClick()} 
          onKeyDown={handleEnter === null ? null :()=>handleEnter(event)}>
          {open ? <input type={type} max={maxvalue} min={minvalue} value={value} onChange={(event)=>setValue(event.currentTarget.value)} style={{position:"absolute", width:"100%"}}/> : null}
         </div>
      </ClickAwayListener>
    )
}
