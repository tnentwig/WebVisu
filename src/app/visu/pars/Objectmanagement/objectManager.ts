import { createBitmapObject } from './Objects/bitmapObject';
import { createButtonObject } from './Objects/buttonObject';
import { createGroupObject } from './Objects/groupObject';
import { createPiechartObject } from './Objects/piechartObject';
import { createPolyObject } from './Objects/polyObject';
import { createSliderObject } from './Objects/sliderObject';
import { createSimpleObject } from './Objects/simpleObject';
import { createSubvisuObject } from './Objects/subvisuObject';

import {
    IBitmapShape,
    IButtonShape,
    IGroupShape,
    IPiechartShape,
    IPolyShape,
    ISliderShape,
    ISimpleShape,
    ISubvisuShape,
} from '../../Interfaces/javainterfaces';

export function createVisuObject(
    javaObject: any,
    shapeParameters: Map<string, string[][]>,
): any {
    // This function acts as broker for different objects
    if (
        ['polygon', 'bezier', 'polyline'].includes(javaObject.shape)
    ) {
        // Its a polyform
        return createPolyObject(
            javaObject as IPolyShape,
            shapeParameters,
        );
    } else if (
        ['round-rect', 'circle', 'line', 'rectangle'].includes(
            javaObject.shape,
        )
    ) {
        // Its a simpleshape
        return createSimpleObject(
            javaObject as ISimpleShape,
            shapeParameters,
        );
    } else if (javaObject.shape === 'bitmap') {
        // Its a bitmap
        return createBitmapObject(
            javaObject as IBitmapShape,
            shapeParameters,
        );
    } else if (javaObject.shape === 'button') {
        // Its a button
        return createButtonObject(
            javaObject as IButtonShape,
            shapeParameters,
        );
    } else if (javaObject.shape === 'group') {
        // Its a subvisu
        return createGroupObject(
            javaObject as IGroupShape,
            shapeParameters,
        );
    } else if (javaObject.shape === 'subvisu') {
        // Its a subvisu
        return createSubvisuObject(
            javaObject as ISubvisuShape,
            shapeParameters,
        );
    } else if (javaObject.shape === 'piechart') {
        // Its a piechart
        return createPiechartObject(
            javaObject as IPiechartShape,
            shapeParameters,
        );
    } else if (javaObject.shape === 'slider') {
        // Its a slider
        return createSliderObject(
            javaObject as ISliderShape,
            shapeParameters,
        );
    } else {
        console.warn(javaObject.shape + ' not supported (yet)');
    }
}
