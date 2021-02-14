import { createBasicObject } from './Objects/basicObject';
import { createPolyObject } from './Objects/polyObject';
import { createPiechartObject } from './Objects/piechartObject';
import { createScrollbarObject } from './Objects/scrollbarObject';
import { createSubvisuObject } from './Objects/subvisuObject';
import {
    IBasicShape,
    IPiechartShape,
    IPolyShape,
    IScrollbarShape,
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
        [
            'round-rect',
            'circle',
            'line',
            'rectangle',
            'bitmap',
            'button',
        ].includes(javaObject.shape)
    ) {
        // Its a simpleshape, bitmap or button
        return createBasicObject(
            javaObject as IBasicShape,
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
    } else if (javaObject.shape === 'scrollbar') {
        // Its a scrollbar
        return createScrollbarObject(
            javaObject as IScrollbarShape,
            shapeParameters,
        );
    }
}
