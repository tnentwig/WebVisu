import { observable, autorun, computed } from 'mobx';
import ComSocket from '../communication/comsocket';
import { IComSocket } from '../Interfaces/interfaces';

interface IStateManager {
    // Variables
    oState :  Map<string,string>;
    xmlDict : Map<string,string>;
    init() : void;
}

export default class StateManager implements IStateManager {
    private static instance : IStateManager=new StateManager();
    // objList contains all variables as objects with the name as key and addr & value of the variable
    oState :  Map<string,string>;
    xmlDict : Map<string,string>;
   
    // this class shall be a singleton
    private constructor() {
        this.oState  = observable(new Map());
        this.xmlDict = new Map();
    }

    public static singleton(){
        return this.instance;
    }

    init(){
        /* hier besteht noch ein Problem, aus welchem Grund auch immer wird Comsocket nur einmal observiert.
        Wenn Wert einmal verändert wurde wird autorun nicht mehr ausgeführt. Ursache musss noch geklärt werden.
        Bis dahin wird per intervallabfrage manuell observiert*/
        this.oState.set("ISONLINE", "FALSE");
        if( this.oState.get("USECURRENTVISU") === "TRUE"){
            this.oState.set("CURRENTVISU", StateManager.singleton().oState.get("STARTVISU"));
            ComSocket.singleton().setValue(".currentvisu", StateManager.singleton().oState.get("STARTVISU"))
            setInterval(()=>{
                let value = ComSocket.singleton().oVisuVariables.get(".currentvisu").value;
                let visuname = this.oState.get("CURRENTVISU").toLowerCase();
                if (value !== undefined) {
                    if ((visuname !== value.toLowerCase()) && value != ""){
                        console.log(visuname);
                        console.log(value.toLowerCase());
                        this.oState.set("CURRENTVISU", value.toLowerCase());
                    }
                }
             } , 300)
        } else {
            if(this.oState.get("USECURRENTVISU") === "FALSE"){
                Object.defineProperty(this.oState, "CURRENTVISU", {
                    get : autorun(()=> {
                        if(this.oState.get("ZOOMVISU") !== undefined){
                            this.oState.set("CURRENTVISU", this.oState.get("ZOOMVISU"));
                        } else {
                            this.oState.set("CURRENTVISU", this.oState.get("STARTVISU"));
                        }
                    }) 
                })
            }
        }
    }
}
