export interface IComSocket {
    // Variables
    oVisuVariables: Map<
        string,
        { addr: string; value: string | undefined }
    >;
    // Functions
    addObservableVar(
        varName: string | undefined,
        varAddr: string,
    ): void;
    addGlobalVar(varName: string | undefined, varAddr: string): void;
    updateVarList(timeoutTime: number): Promise<boolean>;
    setValue(
        varName: string,
        varValue: number | string | boolean,
    ): void;
    getServerURL(): string;
    setServerURL(serverURL: string): void;
    startCyclicUpdate(): void;
    stopCyclicUpdate(): void;
    toggleValue(varName: string): void;
    initObservables(): void;
    evalFunction(stack: string[][]): Function;
    getFunction(stack: string[][]): Function;
}

// ArrayTable
// BasicObject
// - PolyObject
export interface IPolyObject {
    // Variables will be initialised with the parameter values
    cornerCoord: {
        x1: number;
        y1: number;
        x2: number;
        y2: number;
    };
    centerCoord: {
        x: number;
        y: number;
    };
    pointsCoord: number[][];
    isAlarm: boolean; // is the "Variables" > "Change Color" true ?
    fillColor: string; // "Colors" > "Color Inside" (overwriten by "ColorVariables" > "Fill Color")
    fillColorAlarm: string; // "Color" > "Alarm Color Inside" (overwriten by "ColorVariables" > "Fill Color Alarm")
    frameColor: string; // "Colors" > "Color Frame" (overwriten by "ColorVariables" > "Frame Color")
    frameColorAlarm: string; // "Color" > "Alarm Color Frame" (overwriten by "ColorVariables" > "Alarm Color for Frame")
    hasFillColor: boolean; // "Color" > "No Color Inside" (overwriten by "ColorVariables" > "Fill flags")
    hasFrameColor: boolean; // "Color" > "No Frame Color" (overwriten by "ColorVariables" > "Frame flags")
    lineWidth: number; // "Line Width" > "Line Width" (overwriten by "Line Width" > "Variable for Line Width")
    // Positional arguments
    motionAbsX: number; // "Motion Absolute" > "X-Offset"
    motionAbsY: number; // "Motion Absolute" > "Y-Offset"
    motionAbsScale: number; // "Motion Absolute" > "Scale"
    motionAbsAngle: number; // "Motion Absolute" > "Angle"
    // Computed
    transformedCornerCoord: {
        // Transformed corner coordinates
        x1: number;
        y1: number;
        x2: number;
        y2: number;
    };
    transformedCenterCoord: {
        // Transformed center coordinates
        x: number;
        y: number;
    };
    transformedSize: {
        // Transformed width and height
        width: number;
        height: number;
    };
    transformedStartCoord: {
        // Transformed top left corner coordinates
        left: number;
        top: number;
        x: number;
        y: number;
    };
    transformedPointsCoord: number[][];
    /// <div> variables
    pointerEvents: string; // Enable / Disable input
    visibility: string; // Show / Hide the object
    /// <svg> variables
    fill: string; // Inside color
    stroke: string; // Frame color
    strokeWidth: number; // Frame width
    strokeDashArray: string; // Frame style
    transform: string; // Transform the object (scale and rotation only)
    tooltip: string; // Tooltip of the object.
    // Access variables
    writeAccess: boolean;
    readAccess: boolean;
}
// - SimpleObject
export interface ISimpleObject {
    // Variables will be initialised with the parameter values
    cornerCoord: {
        x1: number;
        y1: number;
        x2: number;
        y2: number;
    };
    centerCoord: {
        x: number;
        y: number;
    };
    isAlarm: boolean; // is the "Variables" > "Change Color" true ?
    fillColor: string; // "Colors" > "Color Inside" (overwriten by "ColorVariables" > "Fill Color")
    fillColorAlarm: string; // "Color" > "Alarm Color Inside" (overwriten by "ColorVariables" > "Fill Color Alarm")
    frameColor: string; // "Colors" > "Color Frame" (overwriten by "ColorVariables" > "Frame Color")
    frameColorAlarm: string; // "Color" > "Alarm Color Frame" (overwriten by "ColorVariables" > "Alarm Color for Frame")
    hasFillColor: boolean; // "Color" > "No Color Inside" (overwriten by "ColorVariables" > "Fill flags")
    hasFrameColor: boolean; // "Color" > "No Frame Color" (overwriten by "ColorVariables" > "Frame flags")
    lineWidth: number; // "Line Width" > "Line Width" (overwriten by "Line Width" > "Variable for Line Width")
    // Positional arguments
    motionRelLeft: number; // "Motion Relative" > "Left Edge"
    motionRelRight: number; // "Motion Relative" > "Right Edge"
    motionRelTop: number; // "Motion Relative" > "Top Edge"
    motionRelBottom: number; // "Motion Relative" > "Bottom Edge"
    motionAbsX: number; // "Motion Absolute" > "X-Offset"
    motionAbsY: number; // "Motion Absolute" > "Y-Offset"
    motionAbsScale: number; // "Motion Absolute" > "Scale"
    motionAbsAngle: number; // "Motion Absolute" > "Angle"
    // Computed
    transformedCornerCoord: {
        // Transformed corner coordinates
        x1: number;
        y1: number;
        x2: number;
        y2: number;
    };
    transformedCenterCoord: {
        // Transformed center coordinates
        x: number;
        y: number;
    };
    transformedSize: {
        // Transformed width and height
        width: number;
        height: number;
    };
    transformedStartCoord: {
        // Transformed top left corner coordinates
        left: number;
        top: number;
        x: number;
        y: number;
    };
    /// <div> variables
    pointerEvents: string; // Enable / Disable input
    visibility: string; // Show / Hide the object
    /// <svg> variables
    fill: string; // Inside color
    stroke: string; // Frame color
    strokeWidth: number; // Frame width
    strokeDashArray: string; // Frame style
    transform: string; // Transform the object (scale and rotation only)
    tooltip: string; // Tooltip of the object.
    // Access variables
    writeAccess: boolean;
    readAccess: boolean;
}
// Bitmap
// Button
// Group
export interface IGroupObject {
    // Variables will be initialised with the parameter values
    cornerCoord: {
        x1: number;
        y1: number;
        x2: number;
        y2: number;
    };
    centerCoord: {
        x: number;
        y: number;
    };
    isAlarm: boolean; // is the "Variables" > "Change Color" true ?
    fillColor: string; // "Colors" > "Color Inside" (overwriten by "ColorVariables" > "Fill Color")
    fillColorAlarm: string; // "Color" > "Alarm Color Inside" (overwriten by "ColorVariables" > "Fill Color Alarm")
    frameColor: string; // "Colors" > "Color Frame" (overwriten by "ColorVariables" > "Frame Color")
    frameColorAlarm: string; // "Color" > "Alarm Color Frame" (overwriten by "ColorVariables" > "Alarm Color for Frame")
    hasFillColor: boolean; // "Color" > "No Color Inside" (overwriten by "ColorVariables" > "Fill flags")
    hasFrameColor: boolean; // "Color" > "No Frame Color" (overwriten by "ColorVariables" > "Frame flags")
    lineWidth: number; // "Line Width" > "Line Width" (overwriten by "Line Width" > "Variable for Line Width")
    // Positional arguments
    motionRelLeft: number; // "Motion Relative" > "Left Edge"
    motionRelRight: number; // "Motion Relative" > "Right Edge"
    motionRelTop: number; // "Motion Relative" > "Top Edge"
    motionRelBottom: number; // "Motion Relative" > "Bottom Edge"
    motionAbsX: number; // "Motion Absolute" > "X-Offset"
    motionAbsY: number; // "Motion Absolute" > "Y-Offset"
    motionAbsScale: number; // "Motion Absolute" > "Scale"
    motionAbsAngle: number; // "Motion Absolute" > "Angle"
    // Computed
    transformedCornerCoord: {
        // Transformed corner coordinates
        x1: number;
        y1: number;
        x2: number;
        y2: number;
    };
    transformedCenterCoord: {
        // Transformed center coordinates
        x: number;
        y: number;
    };
    transformedSize: {
        // Transformed width and height
        width: number;
        height: number;
    };
    transformedStartCoord: {
        // Transformed top left corner coordinates
        left: number;
        top: number;
        x: number;
        y: number;
    };
    /// <div> variables
    pointerEvents: string; // Enable / Disable input
    visibility: string; // Show / Hide the object
    /// <svg> variables
    fill: string; // Inside color
    stroke: string; // Frame color
    strokeWidth: number; // Frame width
    strokeDashArray: string; // Frame style
    transform: string; // Transform the object (scale and rotation only)
    tooltip: string; // Tooltip of the object.
    // Access variables
    writeAccess: boolean;
    readAccess: boolean;

    // Group special
    groupScale: {
        // Group master scaling
        x: number;
        y: number;
    };
    groupSize: {
        // Group master size
        width: number;
        height: number;
    };
}
// PieChart
export interface IPiechartObject {
    // Variables will be initialised with the parameter values
    cornerCoord: {
        x1: number;
        y1: number;
        x2: number;
        y2: number;
    };
    centerCoord: {
        x: number;
        y: number;
    };
    pointsCoord: number[][];
    isAlarm: boolean; // is the "Variables" > "Change Color" true ?
    fillColor: string; // "Colors" > "Color Inside" (overwriten by "ColorVariables" > "Fill Color")
    fillColorAlarm: string; // "Color" > "Alarm Color Inside" (overwriten by "ColorVariables" > "Fill Color Alarm")
    frameColor: string; // "Colors" > "Color Frame" (overwriten by "ColorVariables" > "Frame Color")
    frameColorAlarm: string; // "Color" > "Alarm Color Frame" (overwriten by "ColorVariables" > "Alarm Color for Frame")
    hasFillColor: boolean; // "Color" > "No Color Inside" (overwriten by "ColorVariables" > "Fill flags")
    hasFrameColor: boolean; // "Color" > "No Frame Color" (overwriten by "ColorVariables" > "Frame flags")
    lineWidth: number; // "Line Width" > "Line Width" (overwriten by "Line Width" > "Variable for Line Width")
    // Variables for piechart
    enableArc: boolean;
    // Positional arguments
    motionAbsX: number; // "Motion Absolute" > "X-Offset"
    motionAbsY: number; // "Motion Absolute" > "Y-Offset"
    motionAbsScale: number; // "Motion Absolute" > "Scale"
    motionAbsAngle: number; // "Motion Absolute" > "Angle"
    // Computed
    transformedCornerCoord: {
        // Transformed corner coordinates
        x1: number;
        y1: number;
        x2: number;
        y2: number;
    };
    transformedCenterCoord: {
        // Transformed center coordinates
        x: number;
        y: number;
    };
    transformedSize: {
        // Transformed width and height
        width: number;
        height: number;
    };
    transformedStartCoord: {
        // Transformed top left corner coordinates
        left: number;
        top: number;
        x: number;
        y: number;
    };
    transformedPointsCoord: number[][];
    piechartPath: string;
    /// <div> variables
    pointerEvents: string; // Enable / Disable input
    visibility: string; // Show / Hide the object
    /// <svg> variables
    fill: string; // Inside color
    stroke: string; // Frame color
    strokeWidth: number; // Frame width
    strokeDashArray: string; // Frame style
    transform: string; // Transform the object (scale and rotation only)
    tooltip: string; // Tooltip of the object.
    // Access variables
    writeAccess: boolean;
    readAccess: boolean;
}
// Slider
export interface ISliderObject {
    // Variables will be initialised with the parameter values
    cornerCoord: {
        x1: number;
        y1: number;
        x2: number;
        y2: number;
    };
    centerCoord: {
        x: number;
        y: number;
    };
    size: {
        width: number;
        height: number;
    };
    // Variables for slider
    minimumValue: number;
    slider: number;
    maximumValue: number;
    sliderValue: number;
    buttonSize: number;
    sliderSize: number;
    // Positional arguments
    // Computed
    /// <div> variables
    visibility: string; // Show / Hide the object
    /// <svg> variables
    tooltip: string; // Tooltip of the object.
    // Access variables
    writeAccess: boolean;
    readAccess: boolean;
}
// Subvisu
// Future

export interface IBasicObject {
    absCornerCoord: {
        x1: number;
        y1: number;
        x2: number;
        y2: number;
    };
    absCenterCoord: { x: number; y: number };
    transformedCornerCoord: {
        x1: number;
        y1: number;
        x2: number;
        y2: number;
    };
    relCoord: { width: number; height: number };
    relMidpointCoord: { x: number; y: number };
    left: number;
    right: number;
    top: number;
    bottom: number;
    xpos: number;
    ypos: number;
    edge: number;
    scale: number;
    angle: number;
    transform: string;
    normalFillColor: string;
    alarmFillColor: string;
    normalFrameColor: string;
    alarmFrameColor: string;
    hasFillColor: boolean;
    hasFrameColor: boolean;
    lineWidth: number;
    strokeWidth: number;
    display: any;
    tooltip: string;
    eventType: any;
    alarm: boolean;
    fill: string;
    stroke: string;
    strokeDashArray: string;
    writeAccess: boolean;
    readAccess: boolean;
}

//export interface ISimpleObject extends IBasicObject {
export interface IButtonObject {
    // Variables will be initialised with the parameter values
    cornerCoord: {
        x1: number;
        y1: number;
        x2: number;
        y2: number;
    };
    centerCoord: {
        x: number;
        y: number;
    };
    isAlarm: boolean; // is the "Variables" > "Change Color" true ?
    fillColor: string; // "Colors" > "Color Inside" (overwriten by "ColorVariables" > "Fill Color")
    fillColorAlarm: string; // "Color" > "Alarm Color Inside" (overwriten by "ColorVariables" > "Fill Color Alarm")
    frameColor: string; // "Colors" > "Color Frame" (overwriten by "ColorVariables" > "Frame Color")
    frameColorAlarm: string; // "Color" > "Alarm Color Frame" (overwriten by "ColorVariables" > "Alarm Color for Frame")
    hasFillColor: boolean; // "Color" > "No Color Inside" (overwriten by "ColorVariables" > "Fill flags")
    hasFrameColor: boolean; // "Color" > "No Frame Color" (overwriten by "ColorVariables" > "Frame flags")
    lineWidth: number; // "Line Width" > "Line Width" (overwriten by "Line Width" > "Variable for Line Width")
    // Positional arguments
    motionRelLeft: number; // "Motion Relative" > "Left Edge"
    motionRelRight: number; // "Motion Relative" > "Right Edge"
    motionRelTop: number; // "Motion Relative" > "Top Edge"
    motionRelBottom: number; // "Motion Relative" > "Bottom Edge"
    motionAbsX: number; // "Motion Absolute" > "X-Offset"
    motionAbsY: number; // "Motion Absolute" > "Y-Offset"
    motionAbsScale: number; // "Motion Absolute" > "Scale"
    motionAbsAngle: number; // "Motion Absolute" > "Angle"
    // Computed
    transformedCornerCoord: {
        // Transformed corner coordinates
        x1: number;
        y1: number;
        x2: number;
        y2: number;
    };
    transformedCenterCoord: {
        // Transformed center coordinates
        x: number;
        y: number;
    };
    transformedSize: {
        // Transformed width and height
        width: number;
        height: number;
    };
    /// <div> variables
    pointerEvents: string; // Enable / Disable input
    visibility: string; // Show / Hide the object
    /// <svg> variables
    fill: string; // Inside color
    stroke: string; // Frame color
    strokeWidth: number; // Frame width
    strokeDashArray: string; // Frame style
    transform: string; // Transform the object (scale and rotation only)
    tooltip: string; // Tooltip of the object.
    // Access variables
    writeAccess: boolean;
    readAccess: boolean;
}

//export interface IBitmapObject extends IBasicObject {
export interface IBitmapObject {
    // Variables will be initialised with the parameter values
    cornerCoord: {
        x1: number;
        y1: number;
        x2: number;
        y2: number;
    };
    centerCoord: {
        x: number;
        y: number;
    };
    isAlarm: boolean; // is the "Variables" > "Change Color" true ?
    frameColor: string; // "Colors" > "Color Frame" (overwriten by "ColorVariables" > "Frame Color")
    frameColorAlarm: string; // "Color" > "Alarm Color Frame" (overwriten by "ColorVariables" > "Alarm Color for Frame")
    hasFrameColor: boolean; // "Color" > "No Frame Color" (overwriten by "ColorVariables" > "Frame flags")
    lineWidth: number; // "Line Width" > "Line Width" (overwriten by "Line Width" > "Variable for Line Width")
    // Positional arguments
    motionRelLeft: number; // "Motion Relative" > "Left Edge"
    motionRelRight: number; // "Motion Relative" > "Right Edge"
    motionRelTop: number; // "Motion Relative" > "Top Edge"
    motionRelBottom: number; // "Motion Relative" > "Bottom Edge"
    motionAbsX: number; // "Motion Absolute" > "X-Offset"
    motionAbsY: number; // "Motion Absolute" > "Y-Offset"
    motionAbsScale: number; // "Motion Absolute" > "Scale"
    motionAbsAngle: number; // "Motion Absolute" > "Angle"
    // Computed
    transformedCornerCoord: {
        // Transformed corner coordinates
        x1: number;
        y1: number;
        x2: number;
        y2: number;
    };
    transformedCenterCoord: {
        // Transformed center coordinates
        x: number;
        y: number;
    };
    transformedSize: {
        // Transformed width and height
        width: number;
        height: number;
    };
    transformedStartCoord: {
        // Transformed top left corner coordinates
        left: number;
        top: number;
        x: number;
        y: number;
    };
    /// <div> variables
    pointerEvents: string; // Enable / Disable input
    visibility: string; // Show / Hide the object
    /// <svg> variables
    stroke: string; // Frame color
    strokeWidth: number; // Frame width
    strokeDashArray: string; // Frame style
    transform: string; // Transform the object (scale and rotation only)
    tooltip: string; // Tooltip of the object.
    // Access variables
    writeAccess: boolean;
    readAccess: boolean;
}

export interface ISubvisuObject extends IBasicObject {
    visuScale: string;
}
