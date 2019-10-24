
export interface IVisuObject{
    absCornerCoord : {x1:number,y1:number,x2:number,y2:number},
    relCornerCoord : {x1:number,y1:number,x2:number,y2:number}
    relCenterCoord : {x:number,y:number}
    edge : number,
    normalFillColor : string,
    alarmFillColor : string,
    normalFrameColor : string,
    alarmFrameColor : string,
    hasFillColor : boolean,
    hasFrameColor : boolean,
    strokeWidth : number,
    display : any,
    alarm : boolean,
    fill : string,
    stroke : string
}
