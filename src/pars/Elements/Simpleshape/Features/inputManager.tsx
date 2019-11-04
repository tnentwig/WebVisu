import * as React from 'react';
import ComSocket from '../../../../com/comsocket';


type Props = {
    section : JQuery<XMLDocument>,
}

function useOutsideAlerter(ref : any) {
    /**
     * Alert if clicked on outside of element
     */
    function handleClickOutside(event: any) {
      if (ref.current && !ref.current.contains(event.target)) {
        console.log("huhu");
      }
    }
  
    React.useEffect(() => {
      // Bind the event listener
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        // Unbind the event listener on clean up
        document.removeEventListener("mousedown", handleClickOutside);
      };
    });
  }


export const Inputfield :React.FunctionComponent<Props>  = ({section})  => {
    const [type, setType] = React.useState("text");
    const wrapperRef = React.useRef(null);
    useOutsideAlerter(wrapperRef);
  
    return (
        <input ref={wrapperRef} type="text" style={{position:"absolute", verticalAlign:"middle", width:"100%"}}/>
    )
};
