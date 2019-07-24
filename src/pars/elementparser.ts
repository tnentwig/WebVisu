import * as VisuObjects from '../obj/visuobjects'
import { VisuSimpleShapeElement } from '../obj/visuobjects';

export function ParseSimpleShape(section : JQuery<XMLDocument>) {
    // Check if its on of the allowed shapes like rectangle, round-rectangle, circle or line
    let shape = section.children("simple-shape").text();
    if (['round-rect', 'circle', 'line', 'rectangle'].includes(shape)) {
        let objShape = new VisuSimpleShapeElement(
            section.children("simple-shape").text(),
        )
    }
    else {()=>console.error("Simpel-Shape: " + shape + " is not supported!");
    }
}

