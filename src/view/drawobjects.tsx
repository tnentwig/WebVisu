import * as React from "react";
import * as ReactDOM from "react-dom";

import Konva from 'konva';
import { Stage, Layer, Rect, Text, Circle } from 'react-konva';

export function createStage(Coordinates : Array<number>) {
  function stage() {
    return (
    <Stage id ="ha" height={800} width={800}></Stage>)
    }
  ReactDOM.render(stage(),document.getElementById("visualisation"))
}

export function drawplaceholder(Coordinates : Array<number>) {
  function demo() {
      return (
        <Layer>  
          <Rect
            id = "1" 
            x={Coordinates[0]}
            y={Coordinates[1]} 
            width={Coordinates[2]-Coordinates[0]} 
            height={Coordinates[3]-Coordinates[1]} 
            fill="white"
            stroke="black"
            strokeWidth={1}
            />
          </Layer>
    )
  }
  ReactDOM.render(demo(),document.getElementById("ha"));
};
