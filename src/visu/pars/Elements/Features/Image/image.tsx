import * as React from 'react';
import ComSocket from '../../../../communication/comsocket';
import { stringToArray } from '../../../Utils/utilfunctions';
import { getImage } from '../../../Utils/fetchfunctions';
import {useObserver, useLocalStore } from 'mobx-react-lite';
import { get, set } from 'idb-keyval';

type Props = {
    section : Element,
    inlineElement : boolean
}

export const Image : React.FunctionComponent<Props>  = ({section, inlineElement})  => {
  
   // Auxiliary variables
  let rect = stringToArray(section.getElementsByTagName("rect")[0].innerHTML);
 
  let initial = {
    // frameType defines the type of scaling. Possible are isotrophic, anisotrophic or static
    frameType : section.getElementsByTagName("frame-type")[0].innerHTML,
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
if (section.getElementsByTagName("expr-fill-color").length){
    let expression = section.getElementsByTagName("expr-fill-color")[0].getElementsByTagName("expr");
    let varName = expression[0].getElementsByTagName("var")[0].innerHTML;
    Object.defineProperty(initial, "filename", {
    get: function() {
      return "/"+ComSocket.singleton().oVisuVariables.get(varName)!.value;
      }
    })
  }
  /*
  // With surrounding frame?
  if (inlineElement){
    if(section.getElementsByTagName("no-frame-around-bitmap")[0].innerHTML.length){
      initial.inlineDimensions = "100%";
    } else {
      initial.inlineDimensions = "92%";
    }
  }*/

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

  if(section.getElementsByTagName("file-name")[0].innerHTML.length){
    let rawFilename = section.getElementsByTagName("file-name")[0].innerHTML.replace(/.*\\/, '');
    let path = ComSocket.singleton().getServerURL().replace("webvisu.htm", "") + rawFilename;
    // Try to get the image from cache
    get(rawFilename).then(
      (cacheReturn)=>{
        if (cacheReturn === undefined){
          getImage(path).then(
            (datauri)=>{
              state.filename=datauri;
              set(rawFilename,datauri);
            })
        } else {
          state.filename = cacheReturn as any;
        }
      }
    )
    }

  return useObserver(()=>
      <React.Fragment>
        <img src={state.filename} style={{maxHeight:state.maxHeight, maxWidth:state.maxWidth, width:state.percWidth, height:state.percHeight, position:"absolute", pointerEvents:"none", textAlign:"center", margin:state.margin, top: 0, left: 0, bottom: 0, right: 0,}}></img>
      </React.Fragment>
  )
}
