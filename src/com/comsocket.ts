import * as $ from 'jquery';

export default class ComSocket {
    serverURL : string;
    // objList contains all variables as objects with the name as key and addr & value of the variable
    objList: {[key: string] : {addr: string, value: string | undefined}};
    // The objList has no clear sequence. To get the possibily of correct access with numbers as indices use the look up table
    lutList: Array<string>;
    private requestFrame: {preFrame: String, listings: number}

    constructor(serverURL : string) {
        this.serverURL = serverURL;
        this.objList  = {};
        this.requestFrame = {preFrame:'', listings:0};
        this.lutList = []
    }

    addObservableVar(varName : string | undefined, varAddr : string){
        // Add new variable as object to objList
        if (typeof(varName)==='string') {
            this.objList[varName] = 
            {
                addr    : varAddr,
                value   : undefined       // value is undefined at first
            }
        // Add new variable to the request frame
        this.requestFrame.preFrame += this.requestFrame.listings + '|' + varAddr.replace(/,/g, '|') + '|';
        this.requestFrame.listings += 1;
        // Create reference of the key in the LUT
        this.lutList.push(varName);
        }
    }

    updateVarList() {
        return $.ajax({
            type: 'POST',
            url: this.serverURL,
            data: '|0|'+this.requestFrame.listings+'|'+this.requestFrame.preFrame,
        })
        .then((response : string) => {
            let transferarray : Array<string>= (response.slice(1,response.length-1).split('|'));
            for(let i=0; i<transferarray.length; i++) {
                let varName = this.lutList[i];
                this.objList[varName].value=transferarray[i];
            }
            console.log(this.objList);
        })
    }

    setValue(varAdr : string, varValue : number | string | boolean) {
        $.ajax({
            type: 'POST',
            url: this.serverURL,
            data: '|1|1|0|'+ varAdr.replace(/,/g, '|') + '|'+ varValue + '|',
            success: function(data, textStatus, jqXhr) {
                        console.log(data);
            },
            error: function(jqXhr, textStatus, errorThrown) {
                        console.log(errorThrown);
            }
        });
    }
           
            
}







