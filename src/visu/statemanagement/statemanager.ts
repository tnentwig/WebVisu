import { observable, autorun, computed } from 'mobx';
import ComSocket from '../communication/comsocket';
import { IComSocket } from '../Interfaces/interfaces';

interface IStateManager {
    // Variables
    oState :  Map<string,string>;
    xmlDict : Map<string,string>;
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
        this.init();
    }

    public static singleton(){
        return this.instance;
    }

    private init(){
       
        this.oState.set("ISONLINE", "FALSE");
        
        Object.defineProperty(this.oState, "CURRENTVISU", {
            get : autorun(()=> {
                if( this.oState.get("USECURRENTVISU") === "TRUE"){
                    if(ComSocket.singleton().oVisuVariables!.get(".CurrentVisu")!.value !== undefined){
                        this.oState.set("CURRENTVISU", ComSocket.singleton().oVisuVariables.get(".CurrentVisu")!.value)
                    } else {
                        this.oState.set("CURRENTVISU", this.oState.get("STARTVISU"));
                    }
                   
                } else {
                    if(this.oState.get("ZOOMVISU") !== undefined){
                        this.oState.set("CURRENTVISU", this.oState.get("ZOOMVISU"));
                    } else {
                        this.oState.set("CURRENTVISU", this.oState.get("STARTVISU"));
                    }
                }
            })
        })
    }
}
