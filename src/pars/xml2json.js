// @Nitin Patel https://dev.to/niinpatel/converting-xml-to-json-using-recursion-2k4j
class XMLParser {
    constructor(rootDir){
        this.rootDir= rootDir;
    }
    getXMLFile (relPath) {
        $.ajax({
            url: this.rootDir+relPath,
            type: 'GET',
            dataType: 'XML',
            crossDomain: true
        })
            .done(function( data ){
                return data;
            })
            .fail(function( ){
                console.log("Getting the file failed!");
            });
    }

    parseXML2JSON (xmlFile) {
        const parser = new DOMParser(); // Initialize the DOM parser
        const DOMtree = parser.parseFromString(xmlFile, "application/xml"); // Transfer file and MIME-Type
       
        function xml2json(DOMtree) {
            let children = [...DOMtree.children];
            // base case for initializing
            if (!children.length) {
                return DOMtree.innerHTML;
            }
            // Init to object that will be returned
            let jsonResult = {};
            for (let child of children) {
                // Are there siblings with the same name?
                let childIsArray = children.filter(eachChild => eachChild.nodeName === child.nodeName).length > 1;
                // if child is array, save the values as array, else as strings. 
                if (childIsArray) {
                    if (jsonResult[child.nodeName] === undefined) {
                    jsonResult[child.nodeName] = [xml2json(child)];
                    } 
                    else {
                    jsonResult[child.nodeName].push(xml2json(child));
                    }
                } 
                else {
                    jsonResult[child.nodeName] = xml2json(child);
                }
            }
        return jsonResult;
        }
    }
}


objXMLParser = new XMLParser("http://192.168.178.63/")
var xml = objXMLParser.getXMLFile("plc_visu.xml")
var jsonobj = objXMLParser.parseXML2JSON(xml)
var json = JSON.parse()





