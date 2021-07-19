export interface ICommonShape {
    shape: string;
    elementId: string;
    center: number[];
    lineWidth: number;
    hasFrameColor: boolean;
    hasInsideColor: boolean;
    frameColor: string;
    frameColorAlarm: string;
    fillColor: string;
    fillColorAlarm: string;
    enableTextInput: boolean;
    hiddenInput: boolean;
    // Optional properties
    tooltip: string;
    accessLevels: string[];
}

// ArrayTable
export interface IArrayTableShape extends ICommonShape {}
// BasicShapes
// - PolyShapes
export interface IPolyShape extends ICommonShape {
    points: number[][];
    // Computed values
    rect: number[];
}
// - SimpleShapes
export interface ISimpleShape extends ICommonShape {
    rect: number[];
}
// Bitmap
export interface IBitmapShape extends ICommonShape {
    fileName: string;
    transparent: boolean;
    showFrame: boolean;
    clipFrame: boolean;
    frameType: string;
    rect: number[];
}
// Button
export interface IButtonShape extends ICommonShape {
    frameType: string;
    rect: number[];
}
// Group
export interface IGroupShape extends ICommonShape {
    rect: number[];
    showFrame: boolean;
    clipFrame: boolean;
    isoFrame: boolean;
    originalFrame: boolean;
    animateChilds: boolean;
    // Computed values
    rightDownCorner: number[];
}
// PieChart
export interface IPiechartShape extends ICommonShape {
    points: number[][];
    enableArc: boolean;
    // Computed values
    rect: number[];
}
// Slider
export interface ISliderShape extends ICommonShape {
    rect: number[];
    // Computed values
    isHorizontal: boolean;
}
// Subvisu
export interface ISubvisuShape extends ICommonShape {
    showFrame: boolean;
    clipFrame: boolean;
    isoFrame: boolean;
    originalFrame: boolean;
    originalScrollableFrame: boolean;
    noFrameOffset: boolean;
    name: string;
    rect: number[];
    // Computed values
    visuName: string;
    visuSize: number[];
}

// Future
export interface ITrendShape extends ICommonShape {}

export interface IAlarmTableShape extends ICommonShape {}

export interface IUserControlShape extends ICommonShape {}
