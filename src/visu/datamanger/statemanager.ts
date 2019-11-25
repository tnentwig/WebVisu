import { observable, autorun } from 'mobx';
import ComSocket from '../../visu/datamanger/comsocket';

interface IStateManager {
    // Variables
    oState :  Map<string,string>;
    getCurrentVisu : Function;
}

export default class StateManager implements IStateManager {
    private static instance : IStateManager=new StateManager();
    // objList contains all variables as objects with the name as key and addr & value of the variable
    oState :  Map<string,string>;
   
    // this class shall be a singleton
    private constructor() {
        this.oState  = observable(new Map());
        this.init();
    }

    public static singleton(){
        return this.instance;
    }

    private init(){
       
        Object.defineProperty(this.oState, "CURRENTVISU", {
            get : autorun(()=> {
                if( this.oState.get("USECURRENTVISU") === "TRUE"){
                    try {
                        this.oState.set("CURRENTVISU", ComSocket.singleton().oVisuVariables.get(".CurrentVisu")!.value);
                    } catch {
                        this.oState.set("CURRENTVISU", this.oState.get("STARTVISU"));
                        throw new Error("CurrentVisu is not defined.") 
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

    public getCurrentVisu() {
        return this.oState.get("CURRENTVALUE");
    } 
}
