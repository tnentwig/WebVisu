import * as React from 'react';
import { useObserver, useLocalStore } from 'mobx-react-lite';
import ComSocket from '../../../../communication/comsocket';
import { sprintf } from 'sprintf-js';

type Props = {
    textLine : string,
    section : Element,
    dynamicParameters : Map<string, string>,
    numberOfLines : number,
    firstItem : boolean
}

export const Textline :React.FunctionComponent<Props> = ({section, dynamicParameters, textLine, numberOfLines, firstItem}) =>
{ 
    let fontHeight = Number(section.getElementsByTagName("font-height")[0].innerHTML);
    let textAlignHorz = section.getElementsByTagName("text-align-horz")[0].innerHTML;
    let textAlignVert = section.getElementsByTagName("text-align-vert")[0].innerHTML;
    const initial = {
        textVariable : "",
        // Vertical orientation
        dominantBaseline : "middle" as any,
        deltay : fontHeight,
        // Horizontal
        fontHeight : fontHeight,
        textAlignHorz : textAlignHorz,
        textAlignVert : textAlignVert,
        xpos : "50%",
        textOutput : ""
    };
    
    // The text variable: 
    if (dynamicParameters.has("text-display")) {
        let element = dynamicParameters!.get("text-display");
        Object.defineProperty(initial, "textVariable", {
            get: function() {
                let value = ComSocket.singleton().oVisuVariables.get(element)!.value;
                return value;
            }
        });
    }
    // The delta value: 
    if (dynamicParameters.has("expr-font-height")) {
        let element = dynamicParameters!.get("expr-font-height");
        Object.defineProperty(initial, "fontHeight", {
            get: function() {
                let value = (-1)*Number(ComSocket.singleton().oVisuVariables.get(element)!.value);
                value = value/1.4;
                return value;
            }
        });
    }
    // The horzizontal and vertical Align
    if (dynamicParameters.has("expr-text-flags")) {
        let element = dynamicParameters!.get("expr-text-flags");
        Object.defineProperty(initial, "textAlignHorz", {
            get: function() {
                let value = Number(ComSocket.singleton().oVisuVariables.get(element)!.value);
                if ((value/8)>0){
                    if (value == 4){
                        return "center";
                    } else if (value == 2) {
                        return "right";
                    } else if (value == 1) {
                        return "left";
                    } else {
                        return "left"; // This is the standard if passed textflag isn't correct
                    }
                }
            }
        });
        Object.defineProperty(initial, "textAlignVert", {
            get: function() {
                let value = Number(ComSocket.singleton().oVisuVariables.get(element)!.value);
                if (value == 20){
                    return "center";
                } else if (value == 8) {
                    return "top";
                } else if (value == 10) {
                    return "bottom";
                } else {
                    return "top"; // This is the standard if passed textflag isn't correct
                }
            }
        });
    }
    
    Object.defineProperty(initial, "dominantBaseline", {
        get: function() {
            let position = (initial.textAlignVert == 'center') ? 'middle' : ((initial.textAlignVert == 'bottom') ? "baseline" : "hanging");
        return position
        }
    });

    function calcDayOfYear(now:Date) {
        /*
        let start = new Date(now.getFullYear(), 0, 0);
        let diff = (now.valueOf() - start.valueOf()) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
        let oneDay = 1000 * 60 * 60 * 24;
        temp = Math.floor(diff / oneDay).toString();
        */
        var firstJan = new Date(now.getFullYear(),0,1);
        let oneDay = 1000 * 60 * 60 * 24;
        return Math.ceil((now.valueOf() - firstJan.valueOf()) / oneDay);
    }

    function calcWeekNumber8601(now:Date) {
        // The first one seem to work but I found the second one to be better suited for ISO week.
        /*
        let workDate = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
        let dayNum = workDate.getUTCDay() || 7;
        workDate.setUTCDate(workDate.getUTCDate() + 4 - dayNum);
        let firstJanUTC = new Date(Date.UTC(workDate.getUTCFullYear(), 0, 1));
        let oneDay = 1000 * 60 * 60 * 24;
        return Math.ceil((((workDate.valueOf() - firstJanUTC.valueOf()) / oneDay) + 1) / 7);
        */
        let target = new Date(now.valueOf());
        let dayNr = (now.getDay() + 6) % 7;
        target.setDate(target.getDate() - dayNr + 3);
        let firstThursday = target.valueOf();
        target.setMonth(0, 1);
        if (target.getDay() !== 4) {
            target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
        }
        let oneWeek = 1000 * 60 * 60 * 24 * 7;
        return 1 + Math.ceil((firstThursday - target.valueOf()) / oneWeek)
    }

    function calcWeekNumberUS(now:Date) {
        // I am not sure about this one ... May need more research.
        let workDate = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
        let dayNum = workDate.getUTCDay();
        workDate.setUTCDate(workDate.getUTCDate() - dayNum);
        let firstJanUTC = new Date(Date.UTC(workDate.getUTCFullYear(), 0, 1));
        let oneDay = 1000 * 60 * 60 * 24;
        return Math.ceil((((workDate.valueOf() - firstJanUTC.valueOf()) / oneDay) + 1) / 7);
    }
    
    Object.defineProperty(initial, "textOutput", {
        get: function() {
            // CoDeSys has implemented a %t symbol to show date and time. The text is not computed with sprintf then
            // Todo mode the transform system to it's own function ?
            let output : string;
            if (textLine.includes("%t")){
                let temp;
                // let array;
                var now = new Date();
                textLine = textLine.replace(/%t/g, "");
                // %a      Abbreviated weekday name
                if (textLine.includes("%a")) {
                    temp = now.toLocaleString('default', { weekday: 'short' });
                    textLine = textLine.replace(/%a/g, temp);
                }
                // %A      Full weekday name
                if (textLine.includes("%A")) {
                    temp = now.toLocaleString('default', { weekday: 'long' });
                    textLine = textLine.replace(/%A/g, temp);
                }
                // %b      Abbreviated month name
                if (textLine.includes("%b")) {
                    temp = now.toLocaleString('default', { month: 'short' });
                    textLine = textLine.replace(/%b/g, temp);
                }
                // %B      Full month name
                if (textLine.includes("%B")) {
                    temp = now.toLocaleString('default', { month: 'long' });
                    textLine = textLine.replace(/%B/g, temp);
                }
                // %c      Date and time representation appropriate for locale
                if (textLine.includes("%c")) {
                    temp = now.toLocaleString().toString();
                    textLine = textLine.replace(/%c/g, temp);
                }
                // %d      Day of month as decimal number (01 – 31)
                if (textLine.includes("%d")) {
                    temp = now.getDate();
                    temp = ((temp < 10) ? "0" : "") + temp.toString();
                    textLine = textLine.replace(/%d/g, temp);
                }
                // %H      Hour in 24-hour format (00 – 23)
                if (textLine.includes("%H")) {
                    temp = now.getHours();
                    temp = ((temp < 10) ? "0" : "") + temp.toString();
                    textLine = textLine.replace(/%H/g, temp);
                }
                // %I      Hour in 12-hour format (01 – 12)
                if (textLine.includes("%I")) {
                    temp = now.getHours();
                    temp = ((temp > 12) ? temp - 12 : temp);
                    temp = ((temp < 10) ? "0" : "") + temp.toString();
                    textLine = textLine.replace(/%I/g, temp);
                }
                // %j      Day of year as decimal number (001 – 366)
                if (textLine.includes("%j")) {
                    temp = calcDayOfYear(now).toString();
                    textLine = textLine.replace(/%j/g, temp);
                }
                // %m      Month as decimal number (01 – 12)
                if (textLine.includes("%m")) {
                    temp = now.getMonth() + 1;
                    temp = ((temp < 10) ? "0" : "") + temp.toString();
                    textLine = textLine.replace(/%m/g, temp);
                }
                // %M      Minute as decimal number (00 – 59)
                if (textLine.includes("%M")) {
                    temp = now.getMinutes();
                    temp = ((temp < 10) ? "0" : "") + temp.toString();
                    textLine = textLine.replace(/%M/g, temp);
                }
                // %p      Current locale’s A.M./P.M. indicator for 12-hour clock
                if (textLine.includes("%p")) {
                    temp = now.getHours();
                    temp = ((temp >= 12) ? "P.M." : "A.M.");
                    textLine = textLine.replace(/%p/g, temp);
                }
                // %S      Second as decimal number (00 – 59)
                if (textLine.includes("%S")) {
                    temp = now.getSeconds();
                    temp = ((temp < 10) ? "0" : "") + temp.toString();
                    textLine = textLine.replace(/%S/g, temp);
                }
                // %U      Week of year as decimal number, with Sunday as first day of week (00 – 53)
                if (textLine.includes("%U")) {
                    temp = calcWeekNumberUS(now).toString();
                    textLine = textLine.replace(/%U/g, temp);
                }
                // %w      Weekday as decimal number (0 – 6; Sunday is 0)
                if (textLine.includes("%w")) {
                    temp = now.getDay().toString();
                    textLine = textLine.replace(/%w/g, temp);
                }
                // %W      Week of year as decimal number, with Monday as first day of week (00 – 53)
                if (textLine.includes("%W")) {
                    temp = calcWeekNumber8601(now).toString();
                    textLine = textLine.replace(/%W/g, temp);
                }
                // %x      Date representation for current locale
                if (textLine.includes("%x")) {
                    temp = now.toLocaleDateString().toString();
                    textLine = textLine.replace(/%x/g, temp);
                }
                // %X      Time representation for current locale
                if (textLine.includes("%X")) {
                    temp = now.toLocaleTimeString().toString();
                    textLine = textLine.replace(/%X/g, temp);
                }
                // %y      Year without century, as decimal number (00 – 99)
                if (textLine.includes("%y")) {
                    temp = now.getFullYear();
                    temp = (temp % 100).toString();
                    textLine = textLine.replace(/%y/g, temp);
                }
                // %Y      Year with century, as decimal number
                if (textLine.includes("%Y")) {
                    temp = now.getFullYear().toString();
                    textLine = textLine.replace(/%Y/g, temp);
                }
                // %z, %Z  Time-zone name or abbreviation; no characters if time zone is unknown
                if (textLine.includes("%z")) {
                    let dtf = Intl.DateTimeFormat('default', {timeZoneName: 'short'});
                    temp = dtf.formatToParts(now).find((part) => part.type == 'timeZoneName').value;
                    textLine = textLine.replace(/%z/g, temp);
                }
                if (textLine.includes("%Z")) {
                    let dtf = Intl.DateTimeFormat('default', {timeZoneName: 'long'});
                    temp = dtf.formatToParts(now).find((part) => part.type == 'timeZoneName').value;
                    textLine = textLine.replace(/%Z/g, temp);
                }
                /*
                // Just in case replace all %z and %Z to the short version
                if (textLine.includes("%z") || textLine.includes("%Z")) {
                    let dtf = Intl.DateTimeFormat('default', {timeZoneName: 'short'});
                    temp = dtf.formatToParts(now).find((part) => part.type == 'timeZoneName').value;
                    textLine = textLine.replace(/%z/gi, temp);
                }
                */
                // %%      Percent sign
                if (textLine.includes("%%")) {
                    textLine = textLine.replace(/%%/g, "%");
                };

                output = textLine;
            } else {
                try {
                    if (textLine.includes("%|<|") || textLine.includes("|>|")){
                        textLine = textLine.replace("|<|", "<");
                        textLine = textLine.replace("|>|", ">");
                        output = textLine;
                    } else {
                        output = sprintf(textLine, initial.textVariable);
                    }
                } catch {
                    if (!(!textLine || /^\s*$/.test(textLine))) {
                        output = textLine;
                    } else {
                        output = "";
                    }
                }
            }
            return output
        }
    })

    Object.defineProperty(initial, "deltay", {
        get: function() {
            if (firstItem){
                let interim = ((numberOfLines-1)*(initial.fontHeight))/2;
                return interim
            } else {
                return -initial.fontHeight
            }
        }
    })
    
    Object.defineProperty(initial, "xpos", {
        get: function() {
            let position = (initial.textAlignHorz == 'center') ? '50%' : ((initial.textAlignHorz == 'left') ? "5%" : "95%");
        return position
        }
    });
    
    const state = useLocalStore(()=>initial);
    
    return useObserver(()=>
        <tspan
            dominantBaseline = {state.dominantBaseline}
            x={state.xpos} 
            dy={state.deltay}
            >
            {state.textOutput}
        </tspan>
    )
}
