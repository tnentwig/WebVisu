import * as $ from 'jquery';
import * as React from 'react';
import { VisuElements } from '../visu/pars/elementparser'
import { stringToArray } from './pars/Utils/utilfunctions'
import ComSocket from './communication/comsocket'
import StateManager from '../visu/statemanagement/statemanager'
import {useObserver, useLocalStore } from 'mobx-react-lite';

type Props = {
    visuname : string
}

function appendNewVariables(XML : XMLDocument) : Promise<boolean>{
    return new Promise(resolve=>{
        let com = ComSocket.singleton();
        let visuXML=$(XML);
        // Rip all of <variable> in <variablelist> section
        visuXML.children("visualisation").children("variablelist").children("variable").each(function(){
            let variable = $(this);
            com.addObservableVar(variable.attr("name"), variable.text());
        });
        resolve(true);
    })
}

function getVisuxml(url : string) :Promise<XMLDocument> {
    return new Promise(resolve =>{
        fetch(url)
        .then(response => response.text())
        .then(str => (new window.DOMParser()).parseFromString(str, "text/xml"))
        .then((data)=>resolve(data));
    })
}

export const Visualisation :React.FunctionComponent<Props> = ({visuname})=> {
    
    let url= StateManager.singleton().oState.get("ROOTDIR") + "/"+ visuname +".xml";
    let store = useLocalStore(()=>({
        isLoading : true,
        name : "",
        rect :[0,0,0,0],
        xml : "" as any,
        loaded(xml : JQuery<XMLDocument>){
            store.name = xml.children("visualisation").children("name").text();
            store.rect = stringToArray(xml.children("visualisation").children("size").text());
            store.xml = xml;
            store.isLoading = false;
        }
    }))
    React.useEffect(()=>{
        let jQxml : JQuery<XMLDocument>;
        let xml = async function(){
            let plainxml = await getVisuxml(url);
            await appendNewVariables(plainxml);
            jQxml=$(plainxml);
            store.loaded(jQxml);
        };
        xml();
        }, [store, url]);

    return useObserver(()=>
        <div key={store.name} id={store.name} style={{position:"absolute", overflow:"hidden", left:0, top:0, width:store.rect[0]+1, height:store.rect[1]+1}}>
            {store.isLoading ? null :
                <VisuElements visualisation={store.xml}></VisuElements>
            }
        </div>
    )
}
