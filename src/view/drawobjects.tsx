import * as React from "react";
import * as ReactDOM from "react-dom";

export function App() {
  ReactDOM.render(<Placeholder />,document.getElementById("visualisation"));
}

export class Placeholder extends React.Component {
  Coord: number[];
  relCoord: { x1: number; y1: number; x2: number; y2: number; };
  constructor(props: Readonly<{}>, Coord : Array<number>) {
    super(props);
    this.Coord = Coord;
    this.relCoord = {x1:0, y1:0, x2:Coord[2]-Coord[0], y2:Coord[3]-Coord[1]};
  }
  render() : React.ReactNode {
      return(
        <div style={{position:"absolute", left:this.Coord[0], top:this.Coord[1]}}>
          <svg width={this.relCoord.x2} height={this.relCoord.y2}>
            <rect 
              width={this.relCoord.x2}
              height={this.relCoord.y2}
              fill={"white"}
              strokeWidth={2}
              stroke={"black"}  />
            <line 
              x1={this.relCoord.x1}
              y1={this.relCoord.y1}
              x2={this.relCoord.x2}
              y2={this.relCoord.y2}
              stroke={"black"}/>
            <line 
              x1={this.relCoord.x1}
              y1={this.relCoord.y2}
              x2={this.relCoord.x2}
              y2={this.relCoord.y1}
              stroke={"black"}/>
        </svg>
      </div>
      )
  }
};
