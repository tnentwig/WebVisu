export interface IBasicShape {
    shape: string;
    hasInsideColor: boolean;
    fillColor: string;
    fillColorAlarm: string;
    hasFrameColor: boolean;
    frameColor: string;
    frameColorAlarm: string;
    lineWidth: number;
    elementId: string;
    rect: number[];
    center: number[];
    hiddenInput: boolean;
    enableTextInput: boolean;
    tooltip: string;
    accessLevels: string[];
}

export interface IPolyShape extends IBasicShape {
    points: number[][];
}

export interface IPiechartShape extends IBasicShape {
    points: number[][];
}

export interface ISubvisuShape extends IBasicShape {
    visuName: string;
    visuSize: number[];
    showFrame: boolean;
    clipFrame: boolean;
    isoFrame: boolean;
    originalFrame: boolean;
    originalScrollableFrame: boolean;
}

export interface IScrollbarShape {
    shape: string;
    rect: number[];
    tooltip: string;
    horzPosition: boolean;
}
