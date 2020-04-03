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
    // Return null if string is empty
    if (postfix.length === 0) {
      return null;
    } 
    // Remove whitespaces at the end and beginning
    let interim = postfix.trim();
    // Split into array of tokens, this is the resting stack
    let restingStack : Array<string> = interim.split(/\s+/);
    // We initilize the operating stack, this is necessary for mutliple operands
    let operatingStack : Array<number> = [] ;
    // Now we pop the tokens successively form the resting stack
    for (var i = 0; i < restingStack.length; i++) {
      var token = restingStack[i];
      // If the token is a number: psuh them to the operating stack
      if (!isNaN(Number(token))) {
        operatingStack.push(parseFloat(token));
      }
      // Else the token is a operator
      else {
        // The <op>-text has the format: <operation>(<number of involved operands>) if number > 1
        let numberOfOperands = 2;
        let regex = token.match(/\(([^)]+)\)/);
        if (regex !== null){
            numberOfOperands=Number(regex[1]);
        } 
        // Get the operator
        let operator = token.split("(")[0];

        // Choose the opration
        let result :  number;  
        let interim : number;
        switch(operator){
            case "*":
                result = operatingStack.pop();
                for (let i=1; i<numberOfOperands; i++){
                    result = result * operatingStack.pop();
                }
                break;
            case "/":
                result = operatingStack.pop();
                for (let i=1; i<numberOfOperands; i++){
                    result = result / operatingStack.pop();
                }
                break;
            case "-":
                result = operatingStack.pop();
                for (let i=1; i<numberOfOperands; i++){
                    result = -result + operatingStack.pop();
                }
                break;
            case "+":
                result = operatingStack.pop();
                for (let i=1; i<numberOfOperands; i++){
                    result = result + operatingStack.pop();
                }
                break;
            case "MAX":
                result = operatingStack.pop();
                for (let i=1; i<numberOfOperands; i++){
                    let y = result;
                    let x = operatingStack.pop()
                    result = x>y ? x : y;
                }
                break;
            case "MIN":
                result = operatingStack.pop();
                for (let i=1; i<numberOfOperands; i++){
                    let y = result;
                    let x = operatingStack.pop()
                    result = x<y ? x : y;
                }
                break;
            case "=":
                interim = operatingStack.pop();
                for (let i=1; i<2; i++){
                    let y = interim;
                    let x = operatingStack.pop()
                    result = x==y ? 1 : 0;
                }
                break;
            case "<":
                interim = operatingStack.pop();
                for (let i=1; i<2; i++){
                    let y = interim;
                    let x = operatingStack.pop()
                    result = x<y ? 1 : 0;
                }
                break;
            case ">":
                interim = operatingStack.pop();
                for (let i=1; i<2; i++){
                    let y = interim;
                    let x = operatingStack.pop()
                    result = x>y ? 1 : 0;
                }
                break;
            case "<=":
                interim = operatingStack.pop();
                for (let i=1; i<2; i++){
                    let y = interim;
                    let x = operatingStack.pop()
                    result = x<=y ? 1 : 0;
                }
                break;
            case ">=":
                interim = operatingStack.pop();
                for (let i=1; i<2; i++){
                    let y = interim;
                    let x = operatingStack.pop()
                    result = x>=y ? 1 : 0;
                }
                break;
            case "<>":
                interim = operatingStack.pop();
                for (let i=1; i<2; i++){
                    let y = interim;
                    let x = operatingStack.pop()
                    result = x!==y ? 1 : 0;
                }
                break;
            case "AND":
                interim = operatingStack.pop();
                for (let i=1; i<numberOfOperands; i++){
                    let swap = operatingStack.pop();
                    interim = interim & swap;                    
                }
                result = interim;
                break;
            case "OR":
                interim = operatingStack.pop();
                for (let i=1; i<numberOfOperands; i++){
                    let swap = operatingStack.pop();
                    interim = interim | swap;
                }
                result = interim;
                break;
            case "NOT":
                // Has only on operand
                result = Number(!Boolean(operatingStack.pop()));
                break;
            default:
                console.log("The RPN-token: " + token + " is not a valid one!");
        }
        operatingStack.push(result);
      }
    }
    let output = operatingStack.pop();
    return output;
  }

  export function getTextLines(text : string){
    let match;
    let lastMatch = 0;
    let regEx = new RegExp(/(\n)/, "g");
    let stringStack = [];
    text = text.replace(/\t/g, '')
    do {
      match = regEx.exec(text);
      if (match !== null) {
        stringStack.push(text.substring(lastMatch, match.index).replace(/\| \|/g, ' '));
        lastMatch = match.index+1;
      } else {
        stringStack.push(text.substring(lastMatch, text.length).replace(/\| \|/g, ' '))
      }
    } while (match);
    return(stringStack.filter((el)=>el!=""))
  }