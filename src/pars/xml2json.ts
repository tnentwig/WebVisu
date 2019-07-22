import $ from 'jquery';

export default class VisuParser {
    rootDir: string;
    constructor(rootDir: string){
        this.rootDir= rootDir;
    }
    getVisuXML (error: Error, relPath: string) : any {
        $.ajax({
            url: this.rootDir+relPath,
            type: 'GET',
            dataType: 'XML', // if text => no pre-processing, if xml => parseXML preprocessing
            crossDomain: true,
            async : false
        })
        .then(
            function( data : Document ){
            let $xml = $( data );
            let title = $xml.text();
            return title;
        })
        .fail(
            function( ){
            console.error("Getting the file failed!", error);
        });
    }

    //parseVisuElements ()
}