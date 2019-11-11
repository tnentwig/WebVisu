import * as $ from 'jquery';
import { IComSocket } from '../pars/Interfaces/interfaces';
import { observable, action} from "mobx"

export default class ComSocket implements IComSocket {
    private static instance : IComSocket=new ComSocket();
    // objList contains all variables as objects with the name as key and addr & value of the variable
    oVisuVariables: Map<string,{addr: string, value: string | undefined}>;
    //@observable oVisuVariables: {[key: string] : {addr: string, value: string | undefined}};
    // The objList has no clear sequence. To get the possibily of correct access with numbers as indices use the look up table
    private lutKeyVariable: Array<string>;
    private requestFrame: {preFrame: String, listings: number}
    private serverURL : string;

    // this class shall be a singleton
    private constructor() {
        this.serverURL = '';
        this.oVisuVariables  = observable(new Map());
        this.requestFrame = {preFrame:'', listings:0};
        this.lutKeyVariable = [];
    }

    public static singleton(){
        return this.instance;
    }

    setServerURL(serverURL : string) {
        this.serverURL = serverURL;
    }

    addObservableVar(varName : string , varAddr : string){
        // Add new variable as object to objList
        if (typeof(varName)==='string') {
            this.oVisuVariables.set(varName,{
                addr    : varAddr,
                value   : undefined       // value is undefined at first 
            })
        // Add new variable to the request frame
        this.requestFrame.preFrame += this.requestFrame.listings + '|' + varAddr.replace(/,/g, '|') + '|';
        this.requestFrame.listings += 1;
        // Create reference of the key in the LUT 
        this.lutKeyVariable.push(varName);
        }
    }
    updateVarList() {
        try{
        $.ajax({
            type: 'POST',
            contentType: "text/plain",
            url: this.serverURL,
            data: '|0|'+this.requestFrame.listings+'|'+this.requestFrame.preFrame,
        })
        .then((response : string) => {
            let transferarray : Array<string>= (response.slice(1,response.length-1).split('|'));
            for(let i=0; i<transferarray.length; i++) {
                let varName = this.lutKeyVariable[i];
                if (this.oVisuVariables.get(varName).value!==transferarray[i]){
                    action(this.oVisuVariables.get(varName)!.value=transferarray[i]);   
                }
            };
        })

        .fail((error:Error)=>console.log("Connection lost"));
    }
    catch{()=>console.log("Connection lost")}
    }

    startCyclicUpdate(periodms : number) {
        window.setInterval(()=>this.updateVarList(), periodms);
    }

    setValue(varName : string, varValue : number | string | boolean) {
        $.ajax({
            type: 'POST',
            url: this.serverURL,
            contentType: "text/plain",
            data: '|1|1|0|'+ this.oVisuVariables.get(varName)!.addr.replace(/,/g, '|') + '|'+ varValue + '|',
            success: function(data, textStatus, jqXhr) {
                        //console.log(data);
            },
            error: function(jqXhr, textStatus, errorThrown) {
                        console.log("Fehler");
            }
        });
    } 


    // toggleValue : Wechselt den Wert einer boolschen Variablen 
    toggleValue(varName : string) {
        if (this.oVisuVariables.has(varName)){
                let value = Number(this.oVisuVariables.get(varName)!.value);
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

