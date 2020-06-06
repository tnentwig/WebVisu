
export interface IBasicShape {
    shape : string;
    has_inside_color : boolean;
    fill_color : string;
    fill_color_alarm : string;
    has_frame_color : boolean;
    frame_color : string;
    frame_color_alarm : string;
    line_width : number;
    elem_id : string;
    rect : number[];
    center : number[];
    hidden_input : boolean;
    enable_text_input : boolean;
    tooltip : string;
    points : number[][]
}

export interface IComSocket {
    // Variables
    oVisuVariables: Map<string,{addr: string, value: string|undefined}>;
    // Functions
    addObservableVar(varName : string | undefined, varAddr : string) : void;
    addGlobalVar(varName : string | undefined, varAddr : string) : void;
    updateVarList() : void;
    setValue(varName : string, varValue : number | string | boolean) : void;
    getServerURL() : string;
    setServerURL(serverURL : string) : void;
    startCyclicUpdate(periodms : number) : void;
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
    // The following variables are for polyshapes only
    absPoints : number[][],
    relPoints : number[][],
    cssTransform : string,
    cssTransformOrigin : string
    // The following is for piechart only
    startAngle : number,
    endAngle : number,
    piechartPath : string

}

export interface IPiechart extends IBasicObject{
    startAngle : number,
    endAngle : number
}

export interface IPolyShape extends IBasicObject{
    absPoints : number[][],
    relPoints : number[][],
    cssTransform : string,
    cssTransformOrigin : string
}