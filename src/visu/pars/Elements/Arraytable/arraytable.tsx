import * as React from 'react';
import ComSocket from '../../../communication/comsocket';
import {useObserver, useLocalStore } from 'mobx-react-lite';
import { stringToBoolean, rgbToHexString, stringToArray } from '../../Utils/utilfunctions';
import ErrorBoundary from 'react-error-boundary';

type Props = {
    section : JQuery<XMLDocument>
}

export const ArrayTable :React.FunctionComponent<Props> = ({section}) => {
    // Parsing of the fixed parameters
    let rect = stringToArray(section.children("rect").text());
    let center = stringToArray(section.children("center").text());
    let has_inside_color = stringToBoolean(section.children("has-inside-color").text());
    let fill_color = rgbToHexString(section.children("fill-color").text());
    let fill_color_alarm = rgbToHexString(section.children("fill-color-alarm").text());
    let has_frame_color = stringToBoolean(section.children("has-frame-color").text());
    let frame_color = rgbToHexString(section.children("frame-color").text());
    let frame_color_alarm = rgbToHexString(section.children("frame-color-alarm").text());
    let hidden_input = stringToBoolean(section.children("hidden-input").text());
    let enable_text_input = stringToBoolean(section.children("enable-text-input").text());

    // Auxiliary values
    let relCornerCoord = {x1:0, y1:0, x2:rect[2]-rect[0], y2:rect[3]-rect[1]};
    let relCenterCoord = {x:center[0]-rect[0], y:center[1]-rect[1]};
    let edge = 1;

    
    const initial = {value: ""}; 

    Object.defineProperty(initial, "value", {
        get: function() {
            
            ;
        }
    });
    
    const state  = useLocalStore(()=>initial);
    // Return of the react node
    return useObserver(()=>
        <div style={{position:"absolute", left:rect[0], top:rect[1], width:relCornerCoord.x2+2*edge, height:relCornerCoord.y2+2*edge}}>
            <ErrorBoundary>
                <div>dff:{state.value}</div>
                <table style={{width:relCornerCoord.x2, height:relCornerCoord.y2, border:1}}>
                    <tbody>
                        <th>
                            <th></th>
                        </th>
                        <tr>
                            <td>{}</td>
                        </tr>
                    </tbody>
                </table>
            </ErrorBoundary>
        </div>
    )
}