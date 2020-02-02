import { setReactionScheduler } from "mobx/lib/internal";

export function stringToBoolean(booleanExp : string) : boolean {
    let interim = false;
    try{
        interim =JSON.parse(booleanExp)
    }catch{
        throw new Error("Not a boolean expression!");
    }
    return interim;
}

export function rgbToHexString(rgb : string) : string{
    let rgbClr = rgb.split(',');
    let r = Number(rgbClr[0]);
    let g = Number(rgbClr[1]);
    let b = Number(rgbClr[2]);
    let interim = ((r << 16) | (g << 8) | b).toString(16).toUpperCase()
    // Extends the string with zeros ahead to get a length of 6 characters (#xxxxxx)
    while(interim.length !== 6){
        interim = '0'+interim;
    };
    return ('#'+interim);
}

export function numberToHexColor(number : string) : string {
    let interim = Number(number);
    let r = interim & 255;
    let g = (interim >> 8) & 255;
    let b = (interim >> 16) & 255;
    let rgb = ""+((((r << 8) + g) << 8) + b).toString(16);
    while(rgb.length !== 6){
        rgb = '0'+rgb;
    };
    return('#'+rgb);
}

export function stringToArray(stringExp : string) : Array<number> {
    return (stringExp.split(',')).map(Number);
}

export function computeMinMaxCoord(pointArray : number[][]): number[] {
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

export function computePiechartRectCoord(pointArray : number[][]): number[] {
    let deltax = Math.abs(pointArray[1][0] - pointArray[0][0]);
    let deltay = Math.abs(pointArray[1][1] - pointArray[0][1]);
    let x1 = pointArray[0][0]-deltax;
    let x2 = pointArray[0][0]+deltax;
    let y1 = pointArray[0][1]-deltay;
    let y2 = pointArray[0][1]+deltay;
    let rect = [x1, y1, x2, y2]
    return rect;
}

// Calculate the radius of a specifc point
function radius(a : number, b: number, angle : number){
    let r = a*b/(Math.sqrt(Math.pow(b*Math.cos(angle), 2)+Math.pow(a*Math.sin(angle), 2)));
    return r;
}

export function pointArrayToPiechartString(pointArray : number[][], startAngleDegree : number, endAngleDegree : number, strokeWidth: number) : string{
    // Calculate the angle in radiant
    let degreeToRad = 2*Math.PI/360;
    let startAngleRad = -startAngleDegree *degreeToRad;
    let endAngleRad = -endAngleDegree *degreeToRad;
    // Calculate the radii of the ellipse
    let radiusx = Math.abs(pointArray[1][0]-1 - pointArray[0][0]);
    let radiusy = Math.abs(pointArray[1][1]-1 - pointArray[0][1]);
    // Calculate the radius of start and endpoint

    let rStart = radius(radiusx, radiusy, startAngleRad);
    let rEnd = radius(radiusx, radiusy, endAngleRad);
    let start = [Math.cos(startAngleRad)*rStart+radiusx, Math.sin(startAngleRad)*rStart+radiusy];
    let end = [Math.cos(endAngleRad)*rEnd+radiusx, Math.sin(endAngleRad)*rEnd+radiusy];
    let interimArray = pointArray;
    interimArray[2]= start;
    interimArray[3]= end;

    // Claculate the largeArcFlag
    let angleDiff = endAngleDegree - startAngleDegree;
    let largeArcFlag = 1;
    if (angleDiff > 0){
        largeArcFlag = endAngleDegree - startAngleDegree <= 180 ? 1 : 0;
    } else {
        largeArcFlag = endAngleDegree - startAngleDegree <= 180 ? 0 : 1;
    }
    

    var d = [
        // Move to the center of the div element
        "M", interimArray[0][0], interimArray[0][1],
        "L", interimArray[2][0]+strokeWidth, interimArray[2][1]+strokeWidth, 
        "A", radiusx, radiusy, 0, largeArcFlag, 1, interimArray[3][0]+strokeWidth, interimArray[3][1]+strokeWidth,
        "Z"
     ].join(" ");
    return d;      
}
export function polarToCartesian(center : number[], radius : number, angleInDegrees : number) {
    var angleInRadians = (angleInDegrees-90) * Math.PI / 180.0;
    return {
      x: center[0] + (radius * Math.cos(angleInRadians)),
      y: center[1] + (radius * Math.sin(angleInRadians))
    };
  }

export function coordArrayToString(pointArray : number[][]) :string {
    let interim : string[] = [];
    pointArray.forEach((element)=>interim.push(element.join(',')));
    return interim.join(' ');
  }

export function coordArrayToBezierString(pointArray : number[][]) : string {
    let bezier : string = '';
    pointArray.forEach((element,index)=>{
        if (index === 0) {
            bezier += 'M'+ element.join(' ');
        }
        else if (index === 1){
            bezier += ' C' + element.join(' ');
        }
        else {
            bezier += ', ' + element.join(' ');
        }
    })
    return bezier;
}

export function evalRPN(postfix : string) : boolean|number|null {
    let interim = "";
    if (postfix.length === 0) {
      return null;
    } else if (postfix.charAt(postfix.length-1)=== " "){
        interim = postfix.slice(0, -1);
    } else {
        interim = postfix;
    } 
    // Split into array of tokens
    let postfixSplitted : Array<string> = interim.split(/\s+/);
    
    let stack : Array<number> = [] ;
    for (var i = 0; i < postfixSplitted.length; i++) {
      var token = postfixSplitted[i];
      
      // Token is a value, push it on the stack
      if (!isNaN(Number(token))) {
        stack.push(parseFloat(token));
      }
      // Token is operator
      else {
        // Every operation requires two arguments
        if (stack.length < 2) {
            return(stack.pop());
          }
  
        // Pop two items from the top of the stack and push the result of the
        // operation onto the stack.
        let y = stack.pop();
        let x = stack.pop();
        let result :  number;
        switch(token){
            case "*":
                result = x*y;
                break;
            case "/":
                result = x/y;
                break;
            case "-":
                result = x-y;
                break;
            case "+":
                result = y+x;
                break;
            case "MAX":
                result = x>y ? x : y;
                break;
            case "MIN":
                result = x<y ? x : y;
                break;
            // The < and > operators must be at the end of the 
            case "<":
                return(x<y ? 1 : 0);
            case ">":
                return(x>y ? 1 : 0);
            default:
                console.log("The RPN-token: " + token + " is not a valid one!");
        }
        stack.push(result);
      }
    }
  
    if (stack.length > 1) {
      throw new Error('Inputted expression has too many values.');
    }
  
    return stack.pop();
  }
