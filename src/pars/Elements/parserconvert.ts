
export function StringToBoolean(booleanExp : string) : boolean {
    return JSON.parse(booleanExp);
}

export function RgbToHex(rgb : string) : number{
    var rgbClr = rgb.split(',');
    var r = Number(rgbClr[0]);
    var g = Number(rgbClr[1]);
    var b = Number(rgbClr[2]);
    return Number('0x'+(r << 16 | g << 8 | b).toString(16).toUpperCase())
}

export function StringToArray(stringExp : string) : Array<number> {
    return (stringExp.split(',')).map(Number);
}
