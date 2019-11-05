
export interface IVisuObject{
    absCornerCoord : {x1:number,y1:number,x2:number,y2:number},
    absCenterCoord : {x:number, y:number},
    transformedCoord : {x1:number,y1:number,x2:number,y2:number},
    relCoord : {width:number,height:number}
    relMidpointCoord : {x:number,y:number}
    left : number,
    right : number,
    top : number,
    bottom : number,
    xpos : number,
    ypos : number,
    edge : number,
    scale : number,
    angle : number,
    normalFillColor : string,
    alarmFillColor : string,
    normalFrameColor : string,
    alarmFrameColor : string,
    hasFillColor : boolean,
    hasFrameColor : boolean,
    lineWidth : number,
    strokeWidth : number,
    display : any,
    tooltip : string,
    eventType : any,
    alarm : boolean,
    fill : string,
    stroke : string,
    strokeDashArray : string,
    points : number[][]
}
