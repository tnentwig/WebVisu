import { element } from "prop-types";

export function stringToBoolean(booleanExp : string) : boolean {
    return JSON.parse(booleanExp);
}

export function rgbToHexString(rgb : string) : string{
    let rgbClr = rgb.split(',');
    let r = Number(rgbClr[0]);
    let g = Number(rgbClr[1]);
    let b = Number(rgbClr[2]);
    let interim = (r << 16 | g << 8 | b).toString(16).toUpperCase()
    // Extends the string with zeros ahead to get a length of 6 characters (#xxxxxx)
    while(interim.length != 6){
        interim = '0'+interim;
    };
    return ('#'+interim)
}

export function stringToArray(stringExp : string) : Array<number> {
    return (stringExp.split(',')).map(Number);
}

export function computeRectCoord(pointArray : number[][]): number[] {
    let rect = [pointArray[0][0], pointArray[0][1], pointArray[0][0], pointArray[0][1]];
    pointArray.forEach(function(element){
        // Find minimum and maximum of x
        if (element[0] < rect[0]) {rect[0] = element[0]};
        if (element[0] > rect[2]) {rect[2] = element[0]};
        // Find minimum and maximum of y
        if (element[1] < rect[1]) {rect[1] = element[1]};
        if (element[1] > rect[3]) {rect[3] = element[1]};
    })
    return rect;
}

export function coordArrayToString(pointArray : number[][], xOffset : number, yOffset : number) :string {
    let interim : string[] = [];
    pointArray.forEach(function(item, index){
        pointArray[index][0] = item[0]-xOffset;
        pointArray[index][1] = item[1]-yOffset;
    })
    pointArray.forEach((element)=>interim.push(element.join(',')));
    return interim.join(' ');
  }