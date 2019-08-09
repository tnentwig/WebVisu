
class ComSocket {
    serverURL : string;
    varList : Object;
    constructor(serverURL : string) {
        this.serverURL = serverURL;
        this.varList = [];
    }

    addObservableVar(varName : string, varAddr : string){
        this.varList[varName] = 
            {
                addr : varAddr,
                value : this.getValue(varAddr)
            }
    }

    buildRequestFrame() {
        let requestFrame : string;
        let varNum;
        for (let obj in this.varList) {
            obj.varAddr = 
        }

    }

    updateValueList() {
        this.varList.forEach((element: any) => {
            element.value = this.getValue(element.addr);
        });
    }
    
    getValue(varAdr : string)  {
        $.ajax({
            type: 'POST',
            url: this.serverURL,
            data: '|0|1|0|'+ varAdr.replace(/,/g, '|') + '|',
            success: function(data, textStatus, jqXhr) {
                        console.log(data);
            },
            error: function(jqXhr, textStatus, errorThrown) {
                        console.log(errorThrown);
            }
        });
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







