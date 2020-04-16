import { IComSocket } from '../../visu/Interfaces/interfaces';
import { observable, action } from "mobx"
import StateManager from "../statemanagement/statemanager"

export default class ComSocket implements IComSocket {
    
    private static instance : IComSocket=new ComSocket();
    // objList contains all variables as objects with the name as key and addr & value of the variable
    oVisuVariables: Map<string,{addr: string, value: string | undefined}>;
    // The objList has no clear sequence. To get the possibily of correct access with numbers as indices use the look up table
    private globalVariables: Map<string,{addr: string, key: string}>;
    // the actual list and map
    private lutKeyVariable: Array<string>;
    private requestFrame: {frame: String, listings: number}
    private serverURL : string;

    // this class shall be a singleton
    private constructor() {
        this.serverURL = '';
        this.oVisuVariables  = observable(new Map());
        this.globalVariables = new Map();
        this.requestFrame = {frame:'', listings:0};
        this.lutKeyVariable = [];
    }

    public static singleton(){
        return this.instance;
    }

    setServerURL(serverURL : string) {
        this.serverURL = serverURL;
    }

    addGlobalVar(varName : string , varAddr : string){
       this.globalVariables.set(varName.toLowerCase(),{addr : varAddr, key:varName})
    }

    addObservableVar(varName : string , varAddr : string){
        // Add new variable as object to objList
        // Use lower case for variables names on the hole project to prevent faulty accesses to variables
        if (typeof(varName)==='string') {
            this.oVisuVariables.set(varName.toLowerCase(),{
                addr    : varAddr,
                value   : ""       // value is undefined at first 
            })
        // Add new variable to the request frame
        this.requestFrame.frame += this.requestFrame.listings + '|' + varAddr.replace(/,/g, '|') + '|';
        this.requestFrame.listings += 1;
        // Create reference of the key in the LUT 
        this.lutKeyVariable.push(varName.toLowerCase());
        }
    }

    initObservables(){
        // Reset the requestFrame
        this.requestFrame.frame = "";
        this.requestFrame.listings = 0;
        this.lutKeyVariable = [];
        // Reset the observables Map
        this.oVisuVariables = observable(new Map());
        this.globalVariables.forEach((keyValue)=>{
            this.addObservableVar(keyValue.key, keyValue.addr);
        })
    }

    updateVarList() {
        fetch(this.serverURL,
        {
            method: 'POST',
            headers: {"Content-Type" : "text/plain"},
            body: '|0|'+this.requestFrame.listings+'|'+this.requestFrame.frame
        })
        .then((response) => {
            response.arrayBuffer()
            .then((buffer : ArrayBuffer)=>{
                let decoder = new TextDecoder("iso-8859-1");
                let text = decoder.decode(buffer);
                let transferarray : Array<string>= (text.slice(1,text.length-1).split('|'));
                if (transferarray.length === this.requestFrame.listings){
                    for(let i=0; i<transferarray.length; i++) {
                        let varName = this.lutKeyVariable[i];
                        if (this.oVisuVariables.get(varName).value!==transferarray[i]){
                            action(this.oVisuVariables.get(varName)!.value=transferarray[i]);   
                        }
                    };
                    StateManager.singleton().oState.set("ISONLINE", "TRUE");
                }
            })
        })
        .catch(()=>{
            console.log("Connection lost");
            StateManager.singleton().oState.set("ISONLINE", "FALSE");
        });
    }

    startCyclicUpdate(periodms : number) {
        window.setInterval(()=>this.updateVarList(), periodms);
        console.log(this.oVisuVariables)
    }

    setValue(varName : string, varValue : number | string | boolean) {
        fetch(this.serverURL,
            {
                method: 'POST',
                headers: {"Content-Type" : "text/plain"},
                body: '|1|1|0|'+ this.oVisuVariables.get(varName.toLowerCase())!.addr.replace(/,/g, '|') + '|'+ varValue + '|'
            })
    } 


    // toggleValue : Wechselt den Wert einer boolschen Variablen 
    toggleValue(varName : string) {
        let variableName = varName.toLowerCase()
        if (this.oVisuVariables.has(variableName)){
                let value = Number(this.oVisuVariables.get(variableName)!.value);
                if (value === 0 || 1){
                    value === 0 ? value=1 : value=0;
                    this.setValue(varName, value);
                }
                else {
                    throw new Error("The variable to be toggled is not a boolean!")
                }
            }
        else{
            throw new Error("The variable is not defined!")
        }
    }

}

