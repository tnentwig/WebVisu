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
            let varAddress = variable.text().split(",").slice(0,4).join(",");
            // Add the variable to the observables if not already existent

            if (!com.oVisuVariables.has(variable.attr("name"))){
                com.addObservableVar(variable.attr("name"), varAddress);
            }
        });
}

function getVisuxml(url : string) :Promise<XMLDocument> {
    return new Promise(resolve =>{
        fetch(url, {headers:{'Content-Type': 'text/plain; charset=UTF8'}})
        .then((response)=>{
            if (response.status != 400 ){
                response.arrayBuffer()
                .then((buffer)=>{
                    let decoder = new TextDecoder("iso-8859-1");
                    let text = decoder.decode(buffer);
                    let data = new window.DOMParser().parseFromString(text, "text/xml")
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

function replacePlaceholders(data : XMLDocument, replacements : Map<string, string>){
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
                if(ComSocket.singleton().oVisuVariables.has("."+content)){
                    content = "."+content;
                }
                
                // Schlechte Implementierung von Codesys, Doppelpunkte durch einfügen von referenzen möglich
                let textContent = content.replace(/\.\./, '.');
                variable.textContent = textContent.toLowerCase();
                placeholder.parentNode.replaceChild(variable, placeholder);
            } 
        } 
    })
}

export const Visualisation :React.FunctionComponent<Props> = ({visuname, mainVisu, replacementSet})=> {
    
    let store = useLocalStore(()=>({
        isLoading : true,
        rect :[0,0,0,0],
        xml : null as any,
        url : "",
        lastVisuname : ""
    }))

    React.useEffect(()=>{
        let fetchXML = async function(){
            let url = StateManager.singleton().oState.get("ROOTDIR") + "/"+ visuname +".xml";
            let plainxml = await getVisuxml(url);
            initVariables(plainxml, mainVisu);
            replacePlaceholders(plainxml, replacementSet);
            let jQxml=$(plainxml);
            store.rect = stringToArray(jQxml.children("visualisation").children("size").text());
            store.xml = jQxml;
            store.lastVisuname = visuname;
            store.isLoading = false;
        };
        fetchXML();
        }, [store, mainVisu,visuname, replacementSet]);

    return useObserver(()=>
        <div key={visuname} style={{position:"absolute", overflow:"hidden", left:0, top:0, width:store.rect[0]+1, height:store.rect[1]+1}}>
            {store.isLoading ? null :
                <VisuElements visualisation={store.xml}></VisuElements>
            }
        </div>
    )
}
