
export interface ISimpleShape {
    has_inside_color : boolean;
    fill_color : string;
    fill_color_alarm : string;
    has_frame_color : boolean;
    frame_color : string;
    frame_color_alarm : string;
    line_width : number;
    elem_id : number;
    rect : number[];
    center : number[];
    hidden_input : boolean;
    enable_text_input : boolean
}

export interface IComSocket {
    // Variables
    oVisuVariables: Map<string,{addr: string, value: string|undefined}>;
    // Functions
    addObservableVar(varName : string | undefined, varAddr : string) : void;
    updateVarList() : void;
    setValue(varName : string, varValue : number | string | boolean) : void;
    setServerURL(serverURL : string) : void;
    startCyclicUpdate(periodms : number) : void;
    toggleValue(varName : string) : void;
}