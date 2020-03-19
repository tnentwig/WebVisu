import * as $ from 'jquery';
import * as React from 'react';
import { VisuElements } from '../visu/pars/elementparser'
import { stringToArray } from './pars/Utils/utilfunctions'
import ComSocket from './communication/comsocket'
import StateManager from '../visu/statemanagement/statemanager'
import {useObserver, useLocalStore } from 'mobx-react-lite';
import * as JsZip from 'jszip';

type Props = {
    visuname : string,
    mainVisu : boolean,
    replacementSet : Map<string, string>
}

function initVariables(XML : XMLDocument, reset : boolean) : void{
        let com = ComSocket.singleton();
        let visuXML=$(XML);
        // We have to reset the varibales on comsocket, if necessary
        if (reset){
            com.initObservables()
        }
        // Rip all of <variable> in <variablelist> section
        visuXML.children("visualisation").children("variablelist").children("variable").each(function(){
            let variable = $(this);
            // Add the variable to the observables if not already existent
            if (!com.oVisuVariables.has(variable.attr("name"))){
                com.addObservableVar(variable.attr("name"), variable.text());
            }
        });
}

function getVisuxml(url : string, replacements : Map<string, string>) :Promise<XMLDocument> {
    return new Promise(resolve =>{
        fetch(url, {headers:{'Content-Type': 'text/plain; charset=UTF8'}})
        .then((response)=>{
            if (response.status != 400 ){
                response.arrayBuffer()
                .then((buffer)=>{
                    let decoder = new TextDecoder("iso-8859-1");
                    let text = decoder.decode(buffer);
                    let data = new window.DOMParser().parseFromString(text, "text/xml")
                    // Find all placeholder variables 
                    let placeholders = data.getElementsByTagName("placeholder");
                    // Replace all Placeholders
                    Array.from(placeholders).forEach(function (placeholder){
                        let regEx = new RegExp(/\$(.*)\$/gm);
                        let match = regEx.exec(placeholder.textContent);
                        // Replacement
                        if (match != null){
                            let replace = match[1];
                            if (replacements.has(replace)){
                                let variable = data.createElement('var');
                                let content = placeholder.textContent.replace(/\$(.*)\$/, replacements.get(replace));
                                // Schlechte Implementierung von Codesys, Doppelpunkte durch einfügen von referenzen möglich
                                // Es ist auch möglich, dass der erste Dot ganz vergessen wird
                                variable.textContent = content.replace(/\.\./, '.');
                                console.log(variable.textContent);
                                placeholder.parentNode.replaceChild(variable, placeholder);
                            } 
                        } 
                    })
                    resolve(data)
                })
                
            } else {
                let zip = new JsZip();
                let filename = url.split('/').pop()
                let zipName = filename.split(".")[0]+"_xml.zip"
                fetch(zipName, {headers:{'Content-Type': 'binary;'}})
                .then(response => response.arrayBuffer())
                .then((buffer)=>zip.loadAsync(buffer))
                .then((unzipped) => unzipped.file(filename).async("arraybuffer"))
                .then((buffer => {
                    let decoder = new TextDecoder("iso-8859-1");
                    let text = decoder.decode(buffer);
                    let data = new window.DOMParser().parseFromString(text, "text/xml")
                    resolve(data)
                }))
            }
        })    
    })
}

export const Visualisation :React.FunctionComponent<Props> = ({visuname, mainVisu, replacementSet})=> {
    
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
            let plainxml = await getVisuxml(url, replacementSet);
            initVariables(plainxml, mainVisu);
            jQxml=$(plainxml);
            store.loaded(jQxml);
        };
        xml();

        }, [store, url, mainVisu, replacementSet]);

    return useObserver(()=>
        <div key={store.name} id={store.name} style={{position:"absolute", overflow:"hidden", left:0, top:0, width:store.rect[0]+1, height:store.rect[1]+1}}>
            {store.isLoading ? <div></div> :
                <VisuElements visualisation={store.xml}></VisuElements>
            }
        </div>
    )
}
