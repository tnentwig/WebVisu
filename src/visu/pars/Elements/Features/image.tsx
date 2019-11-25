import * as React from 'react';
import * as $ from 'jquery';
import ComSocket from '../../../datamanger/comsocket';
import * as util from '../../Utils/utilfunctions';
import {useObserver, useLocalStore } from 'mobx-react-lite';
import { autorun } from 'mobx';

type Props = {
    section : JQuery<XMLDocument>,
    inlineElement : boolean
}

export const Image : React.FunctionComponent<Props>  = ({section, inlineElement})  => {
  
   // Auxiliary variables
  let rect = util.stringToArray(section.children("rect").text());
 
  let initial = {
    // frameType defines the type of scaling. Possible are isotrophic, anisotrophic or static
    frameType : section.children("frame-type").text(),
    inlineDimensions : "100%",
    // Dimensions of the surrounding div
    rectHeight : rect[3]-rect[1],
    rectWidth : rect[2]-rect[0],
    // Dimensions of the original
    naturalHeight : rect[3]-rect[1],
    naturalWidth : rect[2]-rect[0],
    // Percent dimensions
    percHeight : "",
    percWidth : "",
    maxHeight : "",
    maxWidth : "",
    // Name of the file
    filename : "",
    margin : "auto"
  }

  // Set the filename, it could be a variable or static 
  if(section.children("file-name").text().length){
    initial.filename = "/"+section.children("file-name").text();
  } else if (section.children("expr-fill-color").text().length){
    section.children("expr-fill-color").children("expr").each(function(){
      let varName = $(this).children("var").text();
      Object.defineProperty(initial, "filename", {
      get: function() {
        return "/"+ComSocket.singleton().oVisuVariables.get(varName)!.value;
        }
      })
    })
  }
  // With surrounding frame?
  if (inlineElement){
    if(section.children("no-frame-around-bitmap").text().length){
      initial.inlineDimensions = "100%";
    } else {
      initial.inlineDimensions = "92%";
    }
  }

  switch(initial.frameType){
    case "static":
      break;
    case "isotropic":
      initial.maxWidth = initial.inlineDimensions;
      initial.maxHeight = initial.inlineDimensions;
      if(!inlineElement){
        initial.margin = "top";
      }
      break;
    case "anisotropic":
      initial.percWidth = initial.inlineDimensions;
      initial.percHeight = initial.inlineDimensions;
      break;
  }

  let state = useLocalStore(()=>initial);

  return useObserver(()=>
      <React.Fragment>
        <img src={state.filename} style={{maxHeight:state.maxHeight, maxWidth:state.maxWidth, width:state.percWidth, height:state.percHeight, position:"absolute", pointerEvents:"none", textAlign:"center", margin:state.margin, top: 0, left: 0, bottom: 0, right: 0,}}></img>
      </React.Fragment>
  )
}
