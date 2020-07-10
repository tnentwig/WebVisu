
export interface IComSocket {
    // Variables
    oVisuVariables: Map<string,{addr: string, value: string|undefined}>;
    // Functions
    addObservableVar(varName : string | undefined, varAddr : string) : void;
    addGlobalVar(varName : string | undefined, varAddr : string) : void;
    updateVarList() : Promise<boolean>;
    setValue(varName : string, varValue : number | string | boolean) : void;
    getServerURL() : string;
    setServerURL(serverURL : string) : void;
    startCyclicUpdate() : void;
    stopCyclicUpdate() : void;
    toggleValue(varName : string) : void;
    initObservables() : void;
    evalFunction(stack:string[][]):Function;
}

export interface IBasicObject{
    absCornerCoord : {x1:number,y1:number,x2:number,y2:number},
    absCenterCoord : {x:number, y:number},
    transformedCornerCoord : {x1:number,y1:number,x2:number,y2:number},
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
    writeAccess : boolean,
    readAccess : boolean
}

export interface IPiechartObject extends IBasicObject{
    absPoints : number[][],
    relPoints : number[][],
    startAngle : number,
    endAngle : number,
    piechartPath : string
}

export interface IPolyObject extends IBasicObject{
    absPoints : number[][],
    relPoints : number[][],
    cssTransform : string,
    cssTransformOrigin : string
}

export interface IScrollbarObject {
    absCornerCoord : {x1:number,y1:number,x2:number,y2:number},
    relCornerCoord : {x1:number,y1:number,x2:number,y2:number},
    relMidpointCoord : {x : number, y:number},
    relCoord : {width:number,height:number},
    lowerBound : number,
    upperBound : number,
    value : number,
    scrollvalue : number,
    display : string,
    a : number,
    b1:number,
    b2:number
}

export interface ISubvisuObject extends IBasicObject{
    visuScale : string;
}