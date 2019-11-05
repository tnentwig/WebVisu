import * as React from 'react';
import { Input } from '@material-ui/core';
import { ClickAwayListener } from '@material-ui/core';
import ComSocket from '../../../../com/comsocket';

type Props = {
    section : JQuery<XMLDocument>,
}


export const Inputfield : React.FunctionComponent<Props>  = ({section})  => {
  const [open, setOpen] = React.useState(false);
  const [visible, setVis] = React.useState("visible" as any);
  const handleClick = () => {
    setOpen(prev => !prev);
    setVis("none");
  };

  const handleClickAway = () => {
    setOpen(false);
    setVis("visible");
  };

    return (
      <ClickAwayListener onClickAway={()=>handleClickAway()}>
        <div style={{position:"absolute", width:"100%", height:"100%", pointerEvents:visible}} onClick={()=>handleClick()}>
          {open ? <input type="text" style={{position:"absolute", width:"100%"}}/> : null}
         </div>
      </ClickAwayListener>
    )
};
