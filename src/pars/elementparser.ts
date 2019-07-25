import * as VisuObjects from '../obj/visuobjects'
import { StringToBoolean, RgbToHex, StringToArray } from './parserutils';

export function ParseSimpleShape(section : JQuery<XMLDocument>) {
    // Check if its on of the allowed shapes like rectangle, round-rectangle, circle or line
    let shape = section.children("simple-shape").text();
    if (['round-rect', 'circle', 'line', 'rectangle'].includes(shape)) {
        let obj = new VisuObjects.VisuSimpleShapeElement(
            shape,
            StringToBoolean(section.children("has-inside-color").text()),
            RgbToHex(section.children("fill-color").text()),
            RgbToHex(section.children("fill-color-alarm").text()),
            StringToBoolean(section.children("has-frame-color").text()),
            RgbToHex(section.children("frame-color").text()),
            RgbToHex(section.children("frame-color-alarm").text()),
            Number(section.children("line-width").text()),
            Number(section.children("elem-id").text()),
            StringToArray(section.children("rect").text()),
            StringToArray(section.children("center").text()),
            StringToBoolean(section.children("hidden-input").text()),
            StringToBoolean(section.children("enable-text-input").text())
        )
        console.dir(obj);
    }
    else {()=>console.error("Simple-Shape: <" + shape + "> is not supported!");}
}

